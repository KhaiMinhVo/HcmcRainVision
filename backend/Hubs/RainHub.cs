using Microsoft.AspNetCore.SignalR;
using HcmcRainVision.Backend.Models.Constants;
using HcmcRainVision.Backend.Models.DTOs;
using HcmcRainVision.Backend.Services.Chatbot;
using HcmcRainVision.Backend.Utils;

namespace HcmcRainVision.Backend.Hubs
{
    /// <summary>
    /// SignalR Hub để gửi thông báo mưa thời gian thực xuống tất cả client
    /// </summary>
    public class RainHub : Hub
    {
        private readonly ILogger<RainHub> _logger;
        private readonly RouteMonitoringRegistry _routeMonitoringRegistry;

        public RainHub(ILogger<RainHub> logger, RouteMonitoringRegistry routeMonitoringRegistry)
        {
            _logger = logger;
            _routeMonitoringRegistry = routeMonitoringRegistry;
        }

        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation($"Client connected: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var removedRouteIds = _routeMonitoringRegistry.RemoveConnectionFromAllRoutes(Context.ConnectionId);
            foreach (var routeId in removedRouteIds)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, _routeMonitoringRegistry.GetGroupName(routeId));
            }
            _logger.LogInformation($"Client disconnected: {Context.ConnectionId}");
            await base.OnDisconnectedAsync(exception);
        }

        /// <summary>
        /// Client gọi hàm này để tham gia nhóm theo Phường (WardId)
        /// </summary>
        public async Task JoinWardGroup(string wardId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, wardId);
            _logger.LogInformation($"Client {Context.ConnectionId} joined ward group: {wardId}");
        }

        /// <summary>
        /// Client rời khỏi nhóm Phường
        /// </summary>
        public async Task LeaveWardGroup(string wardId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, wardId);
            _logger.LogInformation($"Client {Context.ConnectionId} left ward group: {wardId}");
        }

        /// <summary>
        /// Client gọi hàm này để tham gia nhóm Dashboard (nhận tất cả thông báo)
        /// </summary>
        public async Task JoinDashboard()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, AppConstants.SignalRGroups.Dashboard);
            _logger.LogInformation($"Client {Context.ConnectionId} joined Dashboard group");
        }

        /// <summary>
        /// Client gửi route để theo dõi mưa realtime.
        /// </summary>
        public async Task StartRouteMonitoring(StartRouteMonitoringRequest request)
        {
            if (request.RoutePoints == null || request.RoutePoints.Count < 2)
            {
                throw new HubException("RoutePoints must contain at least 2 points.");
            }

            var routeId = string.IsNullOrWhiteSpace(request.RouteId)
                ? Guid.NewGuid().ToString("N")
                : request.RouteId.Trim();

            _routeMonitoringRegistry.Upsert(routeId, Context.ConnectionId, request.RoutePoints, request.Origin, request.Destination);
            var groupName = _routeMonitoringRegistry.GetGroupName(routeId);
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

            await Clients.Caller.SendAsync(AppConstants.SignalRGroups.RouteMonitoringStartedMethod, new
            {
                routeId,
                group = groupName,
                timestamp = VietnamTime.Now
            });

            _logger.LogInformation($"Client {Context.ConnectionId} started route monitoring: {routeId}");
        }

        /// <summary>
        /// Client dừng theo dõi mưa realtime cho route.
        /// </summary>
        public async Task StopRouteMonitoring(StopRouteMonitoringRequest request)
        {
            var routeId = request.RouteId?.Trim();
            if (string.IsNullOrWhiteSpace(routeId))
            {
                throw new HubException("RouteId is required.");
            }

            _routeMonitoringRegistry.RemoveConnectionFromRoute(routeId, Context.ConnectionId);
            var groupName = _routeMonitoringRegistry.GetGroupName(routeId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);

            await Clients.Caller.SendAsync(AppConstants.SignalRGroups.RouteMonitoringStoppedMethod, new
            {
                routeId,
                timestamp = VietnamTime.Now
            });

            _logger.LogInformation($"Client {Context.ConnectionId} stopped route monitoring: {routeId}");
        }

        // Client sẽ lắng nghe sự kiện "ReceiveRainAlert" để nhận thông báo mưa
    }
}
