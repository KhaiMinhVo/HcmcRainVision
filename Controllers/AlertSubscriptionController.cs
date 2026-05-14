using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HcmcRainVision.Backend.Data;
using HcmcRainVision.Backend.Models.Entities;
using HcmcRainVision.Backend.Models.DTOs;
using System.Security.Claims;

namespace HcmcRainVision.Backend.Controllers
{
    [Route("api/subscriptions")]
    [ApiController]
    [Authorize] // Bắt buộc phải đăng nhập mới được gọi
    public class AlertSubscriptionController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AlertSubscriptionController(AppDbContext context)
        {
            _context = context;
        }

        // 1. LẤY DANH SÁCH ĐĂNG KÝ CỦA TÔI
        // GET: api/subscriptions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AlertSubscriptionResponseDto>>> GetMySubscriptions()
        {
            var userId = GetCurrentUserId();

            var subs = await _context.AlertSubscriptions
                .Include(s => s.Ward) // Join bảng Ward để lấy tên
                .Where(s => s.UserId == userId)
                .Select(s => new AlertSubscriptionResponseDto
                {
                    SubscriptionId = s.SubscriptionId,
                    WardId = s.WardId ?? "",
                    WardName = s.Ward != null ? s.Ward.WardName : "",
                    DistrictName = s.Ward != null ? s.Ward.DistrictName : null,
                    ThresholdProbability = s.ThresholdProbability,
                    IsEnabled = s.IsEnabled,
                    CreatedAt = s.CreatedAt
                })
                .ToListAsync();

            return Ok(subs);
        }

        // 2. ĐĂNG KÝ NHẬN TIN MỚI (THEO PHƯỜNG)
        // POST: api/subscriptions
        [HttpPost]
        public async Task<ActionResult<AlertSubscriptionResponseDto>> Subscribe([FromBody] CreateSubscriptionDto dto)
        {
            var userId = GetCurrentUserId();

            // Kiểm tra xem Phường có tồn tại không
            var wardExists = await _context.Wards.AnyAsync(w => w.WardId == dto.WardId);
            if (!wardExists)
            {
                return BadRequest(new { message = "Mã phường không hợp lệ." });
            }

            // Kiểm tra xem đã đăng ký phường này chưa (tránh trùng lặp)
            var existingSub = await _context.AlertSubscriptions
                .FirstOrDefaultAsync(s => s.UserId == userId && s.WardId == dto.WardId);

            if (existingSub != null)
            {
                return Conflict(new { message = "Bạn đã đăng ký nhận tin cho phường này rồi." });
            }

            // Tạo mới
            var sub = new AlertSubscription
            {
                UserId = userId,
                WardId = dto.WardId,
                ThresholdProbability = dto.ThresholdProbability,
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.AlertSubscriptions.Add(sub);
            await _context.SaveChangesAsync();

            // Trả về kết quả
            // Lưu ý: Cần load lại Ward để trả về tên phường cho đẹp
            await _context.Entry(sub).Reference(s => s.Ward).LoadAsync();

            return CreatedAtAction(nameof(GetMySubscriptions), new { id = sub.SubscriptionId }, new AlertSubscriptionResponseDto
            {
                SubscriptionId = sub.SubscriptionId,
                WardId = sub.WardId ?? "",
                WardName = sub.Ward?.WardName ?? "",
                DistrictName = sub.Ward?.DistrictName,
                ThresholdProbability = sub.ThresholdProbability,
                IsEnabled = sub.IsEnabled,
                CreatedAt = sub.CreatedAt
            });
        }

        // 3. CẬP NHẬT CẤU HÌNH (SỬA ĐỘ NHẠY HOẶC TẮT/BẬT)
        // PUT: api/subscriptions/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSubscription(Guid id, [FromBody] UpdateSubscriptionDto dto)
        {
            var userId = GetCurrentUserId();

            var sub = await _context.AlertSubscriptions
                .FirstOrDefaultAsync(s => s.SubscriptionId == id && s.UserId == userId);

            if (sub == null)
            {
                return NotFound(new { message = "Không tìm thấy đăng ký này." });
            }

            sub.ThresholdProbability = dto.ThresholdProbability;
            sub.IsEnabled = dto.IsEnabled;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật thành công." });
        }

        // 4. HỦY ĐĂNG KÝ
        // DELETE: api/subscriptions/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Unsubscribe(Guid id)
        {
            var userId = GetCurrentUserId();

            var sub = await _context.AlertSubscriptions
                .FirstOrDefaultAsync(s => s.SubscriptionId == id && s.UserId == userId);

            if (sub == null)
            {
                return NotFound(new { message = "Không tìm thấy đăng ký này." });
            }

            _context.AlertSubscriptions.Remove(sub);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã hủy đăng ký thành công." });
        }

        // Helper: Lấy ID user từ Token JWT
        private int GetCurrentUserId()
        {
            var identity = HttpContext.User.Identity as ClaimsIdentity;
            if (identity != null)
            {
                // Thử tìm claim với ClaimTypes.NameIdentifier (claim mặc định cho UserId)
                var idClaim = identity.FindFirst(ClaimTypes.NameIdentifier);
                if (idClaim != null && int.TryParse(idClaim.Value, out int userId))
                {
                    return userId;
                }
                
                // Fallback: thử tìm claim "id"
                idClaim = identity.FindFirst("id");
                if (idClaim != null && int.TryParse(idClaim.Value, out userId))
                {
                    return userId;
                }
            }
            throw new UnauthorizedAccessException("Không xác định được người dùng.");
        }
    }
}
