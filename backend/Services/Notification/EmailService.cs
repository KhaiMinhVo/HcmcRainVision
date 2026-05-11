using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace HcmcRainVision.Backend.Services.Notification
{
    public interface IEmailService
    {
        Task SendEmailAsync(string recipientEmail, string subject, string body);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SendEmailAsync(string recipientEmail, string subject, string body)
        {
            try
            {
                var emailSettings = _config.GetSection("EmailSettings");

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(emailSettings["SenderName"], emailSettings["SenderEmail"]));
                message.To.Add(new MailboxAddress("", recipientEmail));
                message.Subject = subject;

                // Nội dung email (hỗ trợ HTML)
                var bodyBuilder = new BodyBuilder { HtmlBody = body };
                message.Body = bodyBuilder.ToMessageBody();

                using (var client = new SmtpClient())
                {
                    // Kết nối đến SMTP Server
                    await client.ConnectAsync(
                        emailSettings["SmtpServer"], 
                        int.Parse(emailSettings["Port"] ?? "587"), 
                        MailKit.Security.SecureSocketOptions.StartTls);
                    
                    // Đăng nhập
                    await client.AuthenticateAsync(emailSettings["SenderEmail"], emailSettings["Password"]);
                    
                    // Gửi mail
                    await client.SendAsync(message);
                    
                    // Ngắt kết nối
                    await client.DisconnectAsync(true);
                }

                _logger.LogInformation($"✅ Đã gửi email cảnh báo đến {recipientEmail}");
            }
            catch (Exception ex)
            {
                // Ghi log đầy đủ với stack trace để dễ debug (ví dụ: sai password, lỗi SMTP)
                _logger.LogError(ex, $"❌ Lỗi gửi email đến {recipientEmail}: {ex.Message}");
            }
        }
    }
}
