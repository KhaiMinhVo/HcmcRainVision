using HcmcRainVision.Backend.Data;
using HcmcRainVision.Backend.Models.Constants;
using HcmcRainVision.Backend.Models.Entities;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace HcmcRainVision.Backend.BackgroundJobs;

/// <summary>Keeps a deterministic rain observation fresh for route-avoidance demos.</summary>
public sealed class AlwaysRainDemoWorker : BackgroundService
{
    private static readonly TimeSpan RefreshInterval = TimeSpan.FromMinutes(5);
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AlwaysRainDemoWorker> _logger;

    public AlwaysRainDemoWorker(IServiceProvider serviceProvider, ILogger<AlwaysRainDemoWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(RefreshInterval);
        do
        {
            try
            {
                await RefreshDemoRainAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Không thể làm mới dữ liệu camera mưa demo.");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task RefreshDemoRainAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var log = await context.WeatherLogs
            .Where(item => item.CameraId == DemoRainConstants.CameraId)
            .OrderByDescending(item => item.Timestamp)
            .FirstOrDefaultAsync(cancellationToken);

        if (log == null)
        {
            log = new WeatherLog { CameraId = DemoRainConstants.CameraId };
            context.WeatherLogs.Add(log);
        }

        log.Location = new Point(DemoRainConstants.Longitude, DemoRainConstants.Latitude) { SRID = 4326 };
        log.IsRaining = true;
        log.Confidence = DemoRainConstants.Confidence;
        log.RawIsRaining = true;
        log.RawConfidence = DemoRainConstants.Confidence;
        log.Timestamp = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
    }
}
