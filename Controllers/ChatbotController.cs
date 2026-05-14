using Microsoft.AspNetCore.Mvc;
using HcmcRainVision.Backend.Services.Chatbot;

namespace HcmcRainVision.Backend.Controllers
{
    public class ChatbotMessageRequest
    {
        public string Message { get; set; } = string.Empty;
    }

    [ApiController]
    [Route("api/[controller]")]
    public class ChatbotController : ControllerBase
    {
        private readonly IChatbotService _chatbot;
        private readonly ILogger<ChatbotController> _logger;

        public ChatbotController(IChatbotService chatbot, ILogger<ChatbotController> logger)
        {
            _chatbot = chatbot;
            _logger = logger;
        }

        // GET api/chatbot/debug — tra ve raw rain context dang duoc gui toi Gemini (khong goi Gemini)
        [HttpGet("debug")]
        public async Task<IActionResult> DebugContext(CancellationToken cancellationToken)
        {
            var context = await _chatbot.GetRainContextAsync(cancellationToken);
            return Ok(new { context });
        }

        // POST api/chatbot/message
        [HttpPost("message")]
        public async Task<IActionResult> SendMessage(
            [FromBody] ChatbotMessageRequest request,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request?.Message))
                return BadRequest(new { reply = "Vui lòng nhập câu hỏi." });

            if (request.Message.Length > 500)
                return BadRequest(new { reply = "Câu hỏi quá dài (tối đa 500 ký tự)." });

            _logger.LogInformation("Chatbot nhận câu hỏi: {Msg}", request.Message[..Math.Min(50, request.Message.Length)]);

            var reply = await _chatbot.GetResponseAsync(request.Message, cancellationToken);
            return Ok(new { reply });
        }
    }
}
