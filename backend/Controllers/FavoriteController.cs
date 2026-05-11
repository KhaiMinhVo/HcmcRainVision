using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HcmcRainVision.Backend.Data;
using HcmcRainVision.Backend.Models.Entities;
using System.Security.Claims;

namespace HcmcRainVision.Backend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class FavoriteController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FavoriteController(AppDbContext context)
        {
            _context = context;
        }

        // 1. Lấy danh sách yêu thích
        [HttpGet]
        public async Task<IActionResult> GetFavorites()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            
            var favorites = await _context.FavoriteCameras
                .Where(f => f.UserId == userId)
                .Include(f => f.Camera) // Join bảng Camera để lấy thông tin chi tiết
                .Select(f => f.Camera)
                .ToListAsync();

            return Ok(favorites);
        }

        // 2. Thêm vào yêu thích
        [HttpPost("{cameraId}")]
        public async Task<IActionResult> AddFavorite(string cameraId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            if (await _context.FavoriteCameras.AnyAsync(f => f.UserId == userId && f.CameraId == cameraId))
                return BadRequest("Camera này đã có trong danh sách yêu thích.");

            var favorite = new FavoriteCamera { UserId = userId, CameraId = cameraId };
            _context.FavoriteCameras.Add(favorite);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã thêm vào yêu thích" });
        }

        // 3. Xóa khỏi yêu thích
        [HttpDelete("{cameraId}")]
        public async Task<IActionResult> RemoveFavorite(string cameraId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var favorite = await _context.FavoriteCameras
                .FirstOrDefaultAsync(f => f.UserId == userId && f.CameraId == cameraId);

            if (favorite == null) return NotFound();

            _context.FavoriteCameras.Remove(favorite);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa khỏi yêu thích" });
        }
    }
}
