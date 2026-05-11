using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HcmcRainVision.Backend.Data;

namespace HcmcRainVision.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LocationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LocationController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/location/wards
        // Lấy danh sách tất cả các phường để user chọn khi đăng ký
        [HttpGet("wards")]
        public async Task<IActionResult> GetWards()
        {
            var wards = await _context.Wards
                .OrderBy(w => w.DistrictName)
                .ThenBy(w => w.WardName)
                .Select(w => new
                {
                    w.WardId,
                    w.WardName,
                    w.DistrictName,
                    w.Alias
                })
                .ToListAsync();

            return Ok(wards);
        }

        // GET: api/location/wards/{id}
        // Lấy thông tin chi tiết một phường
        [HttpGet("wards/{id}")]
        public async Task<IActionResult> GetWardById(string id)
        {
            var ward = await _context.Wards
                .Where(w => w.WardId == id)
                .Select(w => new
                {
                    w.WardId,
                    w.WardName,
                    w.DistrictName,
                    w.Alias,
                    w.CreatedAt,
                    w.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (ward == null)
            {
                return NotFound(new { message = "Không tìm thấy phường này." });
            }

            return Ok(ward);
        }

        // GET: api/location/districts
        // Lấy danh sách các quận (distinct từ Ward)
        [HttpGet("districts")]
        public async Task<IActionResult> GetDistricts()
        {
            var districts = await _context.Wards
                .Where(w => w.DistrictName != null)
                .Select(w => w.DistrictName)
                .Distinct()
                .OrderBy(d => d)
                .ToListAsync();

            return Ok(districts);
        }

        // GET: api/location/wards/by-district/{districtName}
        // Lấy danh sách phường theo quận
        [HttpGet("wards/by-district/{districtName}")]
        public async Task<IActionResult> GetWardsByDistrict(string districtName)
        {
            var wards = await _context.Wards
                .Where(w => w.DistrictName == districtName)
                .OrderBy(w => w.WardName)
                .Select(w => new
                {
                    w.WardId,
                    w.WardName,
                    w.DistrictName,
                    w.Alias
                })
                .ToListAsync();

            return Ok(wards);
        }
    }
}
