using HcmcRainVision.Backend.Data;
using HcmcRainVision.Backend.Models.Entities;
using HcmcRainVision.Backend.Models.Enums;
using HcmcRainVision.Backend.Models.Constants;
using NetTopologySuite.Geometries;
using Microsoft.EntityFrameworkCore;

namespace HcmcRainVision.Backend;

public static class TestDataSeeder
{
    public static async Task SeedTestData(AppDbContext context)
    {
        // --- 0. MIGRATE DỮ LIỆU CŨ (Chạy trước khi seed) ---
        await MigrateOldData(context);

        // --- 1. UPSERT WARDS (QĐ2913/2025 - 168 đơn vị hành chính cấp xã) ---
        // ClusterNumber: số cụm thi đua 1-16 theo Phụ lục 1
        // DistrictName: khu vực địa lý (dùng cho chatbot và bộ lọc)
        var wards = new[]
        {
            // ===== CỤM 1 - Khu trung tâm (Q1, Q3, Q10) =====
            new Ward { WardId = "W_SAIGON_C01",      WardName = "Phường Sài Gòn",       DistrictName = "Khu trung tâm", ClusterNumber = 1, Alias = "Gộp từ Bến Nghé và một phần Đa Kao" },
            new Ward { WardId = "W_TANDINH_C01",     WardName = "Phường Tân Định",      DistrictName = "Khu trung tâm", ClusterNumber = 1, Alias = "Cập nhật sau điều chỉnh ranh Đa Kao" },
            new Ward { WardId = "W_BENTHANH_C01",    WardName = "Phường Bến Thành",     DistrictName = "Khu trung tâm", ClusterNumber = 1 },
            new Ward { WardId = "W_CAUONGLANHC01",   WardName = "Phường Cầu Ông Lãnh",  DistrictName = "Khu trung tâm", ClusterNumber = 1 },
            new Ward { WardId = "W_BANCO_C01",       WardName = "Phường Bàn Cờ",        DistrictName = "Khu trung tâm", ClusterNumber = 1 },
            new Ward { WardId = "W_XUANHOA_C01",     WardName = "Phường Xuân Hòa",      DistrictName = "Khu trung tâm", ClusterNumber = 1 },
            new Ward { WardId = "W_NHIEULOC_C01",    WardName = "Phường Nhiêu Lộc",     DistrictName = "Khu trung tâm", ClusterNumber = 1, Alias = "Sáp nhập từ P.9, P.11, P.12, P.14 cũ" },
            new Ward { WardId = "W_DIENHONG_C01",    WardName = "Phường Diên Hồng",     DistrictName = "Khu trung tâm", ClusterNumber = 1 },
            new Ward { WardId = "W_VUONLAI_C01",     WardName = "Phường Vườn Lài",      DistrictName = "Khu trung tâm", ClusterNumber = 1, Alias = "Bao gồm Phường 10 cũ" },
            new Ward { WardId = "W_HOAHUNG_C01",     WardName = "Phường Hòa Hưng",      DistrictName = "Khu trung tâm", ClusterNumber = 1, Alias = "Bao gồm Phường 12 cũ" },

            // ===== CỤM 2 - Khu Nam Sài Gòn (Q4, Q7, Q8) =====
            new Ward { WardId = "W_XOMCHIEU_C02",    WardName = "Phường Xóm Chiếu",     DistrictName = "Khu Nam Sài Gòn", ClusterNumber = 2 },
            new Ward { WardId = "W_KHANHHOI_C02",    WardName = "Phường Khánh Hội",     DistrictName = "Khu Nam Sài Gòn", ClusterNumber = 2 },
            new Ward { WardId = "W_VINHHOI_C02",     WardName = "Phường Vĩnh Hội",      DistrictName = "Khu Nam Sài Gòn", ClusterNumber = 2 },
            new Ward { WardId = "W_TANTHUAN_C02",    WardName = "Phường Tân Thuận",     DistrictName = "Khu Nam Sài Gòn", ClusterNumber = 2 },
            new Ward { WardId = "W_PHUTHUAN_C02",    WardName = "Phường Phú Thuận",     DistrictName = "Khu Nam Sài Gòn", ClusterNumber = 2 },
            new Ward { WardId = "W_TANMY_C02",       WardName = "Phường Tân Mỹ",        DistrictName = "Khu Nam Sài Gòn", ClusterNumber = 2 },
            new Ward { WardId = "W_TANHUNG_C02",     WardName = "Phường Tân Hưng",      DistrictName = "Khu Nam Sài Gòn", ClusterNumber = 2 },
            new Ward { WardId = "W_CHANHHUNG_C02",   WardName = "Phường Chánh Hưng",    DistrictName = "Khu Nam Sài Gòn", ClusterNumber = 2 },
            new Ward { WardId = "W_PHUDINH_C02",     WardName = "Phường Phú Định",      DistrictName = "Khu Nam Sài Gòn", ClusterNumber = 2 },
            new Ward { WardId = "W_BINHDONG_C02",    WardName = "Phường Bình Đông",     DistrictName = "Khu Nam Sài Gòn", ClusterNumber = 2 },

            // ===== CỤM 3 - Khu Chợ Lớn (Q5, Q6, Q11) =====
            new Ward { WardId = "W_CHOQUAN_C03",     WardName = "Phường Chợ Quán",      DistrictName = "Khu Chợ Lớn", ClusterNumber = 3 },
            new Ward { WardId = "W_ANDONG_C03",      WardName = "Phường An Đông",       DistrictName = "Khu Chợ Lớn", ClusterNumber = 3 },
            new Ward { WardId = "W_CHOLON_C03",      WardName = "Phường Chợ Lớn",      DistrictName = "Khu Chợ Lớn", ClusterNumber = 3 },
            new Ward { WardId = "W_BINHTAY_C03",     WardName = "Phường Bình Tây",      DistrictName = "Khu Chợ Lớn", ClusterNumber = 3 },
            new Ward { WardId = "W_BINHTIEN_C03",    WardName = "Phường Bình Tiên",     DistrictName = "Khu Chợ Lớn", ClusterNumber = 3 },
            new Ward { WardId = "W_BINHPHU_C03",     WardName = "Phường Bình Phú",      DistrictName = "Khu Chợ Lớn", ClusterNumber = 3, Alias = "Cụm phường mới sau sáp nhập" },
            new Ward { WardId = "W_PHULAM_C03",      WardName = "Phường Phú Lâm",       DistrictName = "Khu Chợ Lớn", ClusterNumber = 3, Alias = "Cụm phường mới sau sáp nhập" },
            new Ward { WardId = "W_MINHPHUNG_C03",   WardName = "Phường Minh Phụng",    DistrictName = "Khu Chợ Lớn", ClusterNumber = 3 },
            new Ward { WardId = "W_BINHTHO_C03",     WardName = "Phường Bình Thới",     DistrictName = "Khu Chợ Lớn", ClusterNumber = 3 },
            new Ward { WardId = "W_HOABINH_C03",     WardName = "Phường Hòa Bình",      DistrictName = "Khu Chợ Lớn", ClusterNumber = 3 },
            new Ward { WardId = "W_PHUTHO_C03",      WardName = "Phường Phú Thọ",       DistrictName = "Khu Chợ Lớn", ClusterNumber = 3 },

            // ===== CỤM 4 - Khu Tân Bình - Phú Nhuận =====
            new Ward { WardId = "W_TANSONHOA_C04",   WardName = "Phường Tân Sơn Hòa",  DistrictName = "Khu Tân Bình - Phú Nhuận", ClusterNumber = 4 },
            new Ward { WardId = "W_TANSONNHAT_C04",  WardName = "Phường Tân Sơn Nhất", DistrictName = "Khu Tân Bình - Phú Nhuận", ClusterNumber = 4, Alias = "Sáp nhập từ P.4, P.5, P.7" },
            new Ward { WardId = "W_TANHOA_C04",      WardName = "Phường Tân Hòa",       DistrictName = "Khu Tân Bình - Phú Nhuận", ClusterNumber = 4 },
            new Ward { WardId = "W_BAHIEN_C04",      WardName = "Phường Bảy Hiền",      DistrictName = "Khu Tân Bình - Phú Nhuận", ClusterNumber = 4 },
            new Ward { WardId = "W_TANBINH_C04",     WardName = "Phường Tân Bình",      DistrictName = "Khu Tân Bình - Phú Nhuận", ClusterNumber = 4 },
            new Ward { WardId = "W_TANSON_C04",      WardName = "Phường Tân Sơn",       DistrictName = "Khu Tân Bình - Phú Nhuận", ClusterNumber = 4 },
            new Ward { WardId = "W_DUCNHUAN_C04",    WardName = "Phường Đức Nhuận",     DistrictName = "Khu Tân Bình - Phú Nhuận", ClusterNumber = 4 },
            new Ward { WardId = "W_PHUNHUAN_C04",    WardName = "Phường Phú Nhuận",     DistrictName = "Khu Tân Bình - Phú Nhuận", ClusterNumber = 4 },
            new Ward { WardId = "W_CAUKIEU_C04",     WardName = "Phường Cầu Kiệu",      DistrictName = "Khu Tân Bình - Phú Nhuận", ClusterNumber = 4 },

            // ===== CỤM 5 - Khu Bình Tân - Tân Phú =====
            new Ward { WardId = "W_ANLAC_C05",       WardName = "Phường An Lạc",        DistrictName = "Khu Bình Tân - Tân Phú", ClusterNumber = 5 },
            new Ward { WardId = "W_BINHTAN_C05",     WardName = "Phường Bình Tân",      DistrictName = "Khu Bình Tân - Tân Phú", ClusterNumber = 5 },
            new Ward { WardId = "W_TANTAO_C05",      WardName = "Phường Tân Tạo",       DistrictName = "Khu Bình Tân - Tân Phú", ClusterNumber = 5 },
            new Ward { WardId = "W_BINHTRIDONG_C05", WardName = "Phường Bình Trị Đông", DistrictName = "Khu Bình Tân - Tân Phú", ClusterNumber = 5 },
            new Ward { WardId = "W_BINHHUNGHOA_C05", WardName = "Phường Bình Hưng Hòa", DistrictName = "Khu Bình Tân - Tân Phú", ClusterNumber = 5 },
            new Ward { WardId = "W_TAYTHANH_C05",    WardName = "Phường Tây Thạnh",     DistrictName = "Khu Bình Tân - Tân Phú", ClusterNumber = 5 },
            new Ward { WardId = "W_TANSONNHI_C05",   WardName = "Phường Tân Sơn Nhì",   DistrictName = "Khu Bình Tân - Tân Phú", ClusterNumber = 5 },
            new Ward { WardId = "W_PHUTHOHOA_C05",   WardName = "Phường Phú Thọ Hòa",   DistrictName = "Khu Bình Tân - Tân Phú", ClusterNumber = 5 },
            new Ward { WardId = "W_TANPHU_C05",      WardName = "Phường Tân Phú",       DistrictName = "Khu Bình Tân - Tân Phú", ClusterNumber = 5 },
            new Ward { WardId = "W_PHUTHANH_C05",    WardName = "Phường Phú Thạnh",     DistrictName = "Khu Bình Tân - Tân Phú", ClusterNumber = 5 },

            // ===== CỤM 6 - Khu Bình Thạnh - Gò Vấp =====
            new Ward { WardId = "W_HIEPBINH_C06",    WardName = "Phường Hiệp Bình",     DistrictName = "Khu Bình Thạnh - Gò Vấp", ClusterNumber = 6 },
            new Ward { WardId = "W_THUDUC_C06",      WardName = "Phường Thủ Đức",       DistrictName = "Khu Bình Thạnh - Gò Vấp", ClusterNumber = 6 },
            new Ward { WardId = "W_GOVAP_C06",       WardName = "Phường Gò Vấp",        DistrictName = "Khu Bình Thạnh - Gò Vấp", ClusterNumber = 6 },
            new Ward { WardId = "W_THONGTAYHOI_C06", WardName = "Phường Thông Tây Hội", DistrictName = "Khu Bình Thạnh - Gò Vấp", ClusterNumber = 6 },
            new Ward { WardId = "W_GIADINH_C06",     WardName = "Phường Gia Định",      DistrictName = "Khu Bình Thạnh - Gò Vấp", ClusterNumber = 6, Alias = "Gộp từ P.1, P.2, P.3, P.7, P.17" },
            new Ward { WardId = "W_BINHTHANH_C06",   WardName = "Phường Bình Thạnh",    DistrictName = "Khu Bình Thạnh - Gò Vấp", ClusterNumber = 6 },
            new Ward { WardId = "W_BINHLOITRUNG_C06",WardName = "Phường Bình Lợi Trung", DistrictName = "Khu Bình Thạnh - Gò Vấp", ClusterNumber = 6 },
            new Ward { WardId = "W_THANHMYTAY_C06",  WardName = "Phường Thạnh Mỹ Tây",  DistrictName = "Khu Bình Thạnh - Gò Vấp", ClusterNumber = 6, Alias = "Gộp từ P.19, P.22, P.25" },
            new Ward { WardId = "W_BINHQUOI_C06",    WardName = "Phường Bình Quới",     DistrictName = "Khu Bình Thạnh - Gò Vấp", ClusterNumber = 6 },

            // ===== CỤM 7 - Khu Quận 12 - Gò Vấp =====
            new Ward { WardId = "W_TRUNGMYTAY_C07",  WardName = "Phường Trung Mỹ Tây",  DistrictName = "Khu Quận 12 - Bắc Sài Gòn", ClusterNumber = 7 },
            new Ward { WardId = "W_TANTHOIHIEP_C07", WardName = "Phường Tân Thới Hiệp", DistrictName = "Khu Quận 12 - Bắc Sài Gòn", ClusterNumber = 7 },
            new Ward { WardId = "W_THOIAN_C07",      WardName = "Phường Thới An",       DistrictName = "Khu Quận 12 - Bắc Sài Gòn", ClusterNumber = 7 },
            new Ward { WardId = "W_ANPHUDONG_C07",   WardName = "Phường An Phú Đông",   DistrictName = "Khu Quận 12 - Bắc Sài Gòn", ClusterNumber = 7 },
            new Ward { WardId = "W_DONGHUNGTHUANC07",WardName = "Phường Đông Hưng Thuận", DistrictName = "Khu Quận 12 - Bắc Sài Gòn", ClusterNumber = 7 },
            new Ward { WardId = "W_HANHTHONG_C07",   WardName = "Phường Hạnh Thông",    DistrictName = "Khu Quận 12 - Bắc Sài Gòn", ClusterNumber = 7 },
            new Ward { WardId = "W_ANNHON_C07",      WardName = "Phường An Nhơn",       DistrictName = "Khu Quận 12 - Bắc Sài Gòn", ClusterNumber = 7 },
            new Ward { WardId = "W_ANHOINDONG_C07",  WardName = "Phường An Hội Đông",   DistrictName = "Khu Quận 12 - Bắc Sài Gòn", ClusterNumber = 7 },
            new Ward { WardId = "W_ANHOITAY_C07",    WardName = "Phường An Hội Tây",    DistrictName = "Khu Quận 12 - Bắc Sài Gòn", ClusterNumber = 7 },

            // ===== CỤM 8 - TP. Thủ Đức (Đông) =====
            new Ward { WardId = "W_ANKHANH_C08",     WardName = "Phường An Khánh",      DistrictName = "TP. Thủ Đức", ClusterNumber = 8 },
            new Ward { WardId = "W_TAMBINH_C08",     WardName = "Phường Tam Bình",      DistrictName = "TP. Thủ Đức", ClusterNumber = 8 },
            new Ward { WardId = "W_LINHXUAN_C08",    WardName = "Phường Linh Xuân",     DistrictName = "TP. Thủ Đức", ClusterNumber = 8 },
            new Ward { WardId = "W_TANGNHONPHU_C08", WardName = "Phường Tăng Nhơn Phú", DistrictName = "TP. Thủ Đức", ClusterNumber = 8 },
            new Ward { WardId = "W_LONGBINH_C08",    WardName = "Phường Long Bình",     DistrictName = "TP. Thủ Đức", ClusterNumber = 8 },
            new Ward { WardId = "W_LONGPHUOC_C08",   WardName = "Phường Long Phước",    DistrictName = "TP. Thủ Đức", ClusterNumber = 8 },
            new Ward { WardId = "W_LONGTRUONG_C08",  WardName = "Phường Long Trường",   DistrictName = "TP. Thủ Đức", ClusterNumber = 8 },
            new Ward { WardId = "W_CATLAI_C08",      WardName = "Phường Cát Lái",       DistrictName = "TP. Thủ Đức", ClusterNumber = 8 },
            new Ward { WardId = "W_BINHTRUNG_C08",   WardName = "Phường Bình Trưng",    DistrictName = "TP. Thủ Đức", ClusterNumber = 8 },
            new Ward { WardId = "W_PHUOCLONG_C08",   WardName = "Phường Phước Long",    DistrictName = "TP. Thủ Đức", ClusterNumber = 8 },

            // ===== CỤM 9 - Bình Dương (đô thị phía Nam) =====
            new Ward { WardId = "W_DIAN_C09",        WardName = "Phường Dĩ An",         DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 9 },
            new Ward { WardId = "W_TANDONGHIEP_C09", WardName = "Phường Tân Đông Hiệp", DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 9 },
            new Ward { WardId = "W_DONGHOA_C09",     WardName = "Phường Đông Hòa",      DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 9 },
            new Ward { WardId = "W_THUANAN_C09",     WardName = "Phường Thuận An",      DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 9 },
            new Ward { WardId = "W_THUANGIAO_C09",   WardName = "Phường Thuận Giao",    DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 9 },
            new Ward { WardId = "W_LAITHIEU_C09",    WardName = "Phường Lái Thiêu",     DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 9 },
            new Ward { WardId = "W_ANPHU_C09",       WardName = "Phường An Phú",        DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 9 },
            new Ward { WardId = "W_BINHHOA_C09",     WardName = "Phường Bình Hòa",      DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 9 },
            new Ward { WardId = "W_PHULOI_C09",      WardName = "Phường Phú Lợi",       DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 9 },
            new Ward { WardId = "W_CHANHHIEP_C09",   WardName = "Phường Chánh Hiệp",    DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 9 },
            new Ward { WardId = "W_BINHDUONG_C09",   WardName = "Phường Bình Dương",    DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 9 },
            new Ward { WardId = "W_THUDAUMOT_C09",   WardName = "Phường Thủ Dầu Một",   DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 9 },

            // ===== CỤM 10 - Bình Dương (đô thị phía Bắc) =====
            new Ward { WardId = "W_TANUYEN_C10",     WardName = "Phường Tân Uyên",      DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 10 },
            new Ward { WardId = "W_TANHIEP_C10",     WardName = "Phường Tân Hiệp",      DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 10 },
            new Ward { WardId = "W_TANKHANH_C10",    WardName = "Phường Tân Khánh",     DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 10 },
            new Ward { WardId = "W_PHUAN_C10",       WardName = "Phường Phú An",        DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 10 },
            new Ward { WardId = "W_BENCAT_C10",      WardName = "Phường Bến Cát",       DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 10 },
            new Ward { WardId = "W_CHANPHUHOA_C10",  WardName = "Phường Chánh Phú Hòa", DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 10 },
            new Ward { WardId = "W_HOALOI_C10",      WardName = "Phường Hòa Lợi",       DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 10 },
            new Ward { WardId = "W_TAYNAM_C10",      WardName = "Phường Tây Nam",       DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 10 },
            new Ward { WardId = "W_BINHCO_C10",      WardName = "Phường Bình Cơ",       DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 10 },
            new Ward { WardId = "W_LONGNGUYEN_C10",  WardName = "Phường Long Nguyên",   DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 10 },
            new Ward { WardId = "W_VINHTAN_C10",     WardName = "Phường Vĩnh Tân",      DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 10 },
            new Ward { WardId = "W_THOIHOA_C10",     WardName = "Phường Thới Hòa",      DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 10 },

            // ===== CỤM 11 - Bà Rịa - Vũng Tàu (đô thị) =====
            new Ward { WardId = "W_VUNGTAU_C11",     WardName = "Phường Vũng Tàu",      DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 11 },
            new Ward { WardId = "W_TAMTHANG_C11",    WardName = "Phường Tam Thắng",     DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 11 },
            new Ward { WardId = "W_RACHDUA_C11",     WardName = "Phường Rạch Dừa",      DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 11 },
            new Ward { WardId = "W_PHUOCTHANG_C11",  WardName = "Phường Phước Thắng",   DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 11 },
            new Ward { WardId = "W_BARIA_C11",       WardName = "Phường Bà Rịa",        DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 11 },
            new Ward { WardId = "W_LONGHUONG_C11",   WardName = "Phường Long Hương",    DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 11 },
            new Ward { WardId = "W_TAMLONG_C11",     WardName = "Phường Tam Long",      DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 11 },
            new Ward { WardId = "W_PHUMY_C11",       WardName = "Phường Phú Mỹ",        DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 11 },
            new Ward { WardId = "W_TANPHUOC_C11",    WardName = "Phường Tân Phước",     DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 11 },
            new Ward { WardId = "W_TANHAI_C11",      WardName = "Phường Tân Hải",       DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 11 },
            new Ward { WardId = "W_TANTHANH_C11",    WardName = "Phường Tân Thành",     DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 11 },

            // ===== CỤM 12 - Khu Nam ngoại thành (Bình Chánh, Nhà Bè, Cần Giờ) =====
            new Ward { WardId = "W_VINHLOC_C12",     WardName = "Xã Vĩnh Lộc",         DistrictName = "Khu Nam ngoại thành", ClusterNumber = 12 },
            new Ward { WardId = "W_TANVINHLOC_C12",  WardName = "Xã Tân Vĩnh Lộc",     DistrictName = "Khu Nam ngoại thành", ClusterNumber = 12 },
            new Ward { WardId = "W_BINHLOI_C12",     WardName = "Xã Bình Lợi",         DistrictName = "Khu Nam ngoại thành", ClusterNumber = 12 },
            new Ward { WardId = "W_TANNHUT_C12",     WardName = "Xã Tân Nhựt",         DistrictName = "Khu Nam ngoại thành", ClusterNumber = 12 },
            new Ward { WardId = "W_BINHCHANH_C12",   WardName = "Xã Bình Chánh",       DistrictName = "Khu Nam ngoại thành", ClusterNumber = 12 },
            new Ward { WardId = "W_HUNGLONG_C12",    WardName = "Xã Hưng Long",        DistrictName = "Khu Nam ngoại thành", ClusterNumber = 12 },
            new Ward { WardId = "W_BINHHUNG_C12",    WardName = "Xã Bình Hưng",        DistrictName = "Khu Nam ngoại thành", ClusterNumber = 12 },
            new Ward { WardId = "W_BINHKHANH_C12",   WardName = "Xã Bình Khánh",       DistrictName = "Khu Nam ngoại thành", ClusterNumber = 12 },
            new Ward { WardId = "W_ANTHOIGDONG_C12", WardName = "Xã An Thới Đông",     DistrictName = "Khu Nam ngoại thành", ClusterNumber = 12 },
            new Ward { WardId = "W_CANGIO_C12",      WardName = "Xã Cần Giờ",          DistrictName = "Khu Nam ngoại thành", ClusterNumber = 12 },
            new Ward { WardId = "W_THANHAN_C12",     WardName = "Xã Thạnh An",         DistrictName = "Khu Nam ngoại thành", ClusterNumber = 12 },
            new Ward { WardId = "W_NHABE_C12",       WardName = "Xã Nhà Bè",           DistrictName = "Khu Nam ngoại thành", ClusterNumber = 12 },
            new Ward { WardId = "W_HIEPPHUOC_C12",   WardName = "Xã Hiệp Phước",       DistrictName = "Khu Nam ngoại thành", ClusterNumber = 12 },

            // ===== CỤM 13 - Khu Tây Bắc ngoại thành (Hóc Môn, Củ Chi) =====
            new Ward { WardId = "W_CUCHI_C13",       WardName = "Xã Củ Chi",           DistrictName = "Khu Tây Bắc ngoại thành", ClusterNumber = 13 },
            new Ward { WardId = "W_TANANHOI_C13",    WardName = "Xã Tân An Hội",       DistrictName = "Khu Tây Bắc ngoại thành", ClusterNumber = 13 },
            new Ward { WardId = "W_THAIMY_C13",      WardName = "Xã Thái Mỹ",          DistrictName = "Khu Tây Bắc ngoại thành", ClusterNumber = 13 },
            new Ward { WardId = "W_ANNHONTAY_C13",   WardName = "Xã An Nhơn Tây",      DistrictName = "Khu Tây Bắc ngoại thành", ClusterNumber = 13 },
            new Ward { WardId = "W_NHUANDUC_C13",    WardName = "Xã Nhuận Đức",        DistrictName = "Khu Tây Bắc ngoại thành", ClusterNumber = 13 },
            new Ward { WardId = "W_PHUHOAGDONG_C13", WardName = "Xã Phú Hòa Đông",    DistrictName = "Khu Tây Bắc ngoại thành", ClusterNumber = 13 },
            new Ward { WardId = "W_BINHMY_C13",      WardName = "Xã Bình Mỹ",          DistrictName = "Khu Tây Bắc ngoại thành", ClusterNumber = 13 },
            new Ward { WardId = "W_DONGTHANH_C13",   WardName = "Xã Đông Thạnh",       DistrictName = "Khu Tây Bắc ngoại thành", ClusterNumber = 13 },
            new Ward { WardId = "W_HOCMON_C13",      WardName = "Xã Hóc Môn",          DistrictName = "Khu Tây Bắc ngoại thành", ClusterNumber = 13 },
            new Ward { WardId = "W_XUANTHOISON_C13", WardName = "Xã Xuân Thới Sơn",    DistrictName = "Khu Tây Bắc ngoại thành", ClusterNumber = 13 },
            new Ward { WardId = "W_BADIEM_C13",      WardName = "Xã Bà Điểm",          DistrictName = "Khu Tây Bắc ngoại thành", ClusterNumber = 13 },

            // ===== CỤM 14 - Bình Dương (nông thôn) =====
            new Ward { WardId = "W_THUONGTAN_C14",   WardName = "Xã Thường Tân",        DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 14 },
            new Ward { WardId = "W_BACTANUYEN_C14",  WardName = "Xã Bắc Tân Uyên",     DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 14 },
            new Ward { WardId = "W_PHUGIAO_C14",     WardName = "Xã Phú Giáo",         DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 14 },
            new Ward { WardId = "W_PHUOCHOA_C14",    WardName = "Xã Phước Hòa",        DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 14 },
            new Ward { WardId = "W_PHUOCTHANH_C14",  WardName = "Xã Phước Thành",      DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 14 },
            new Ward { WardId = "W_ANLONG_C14",      WardName = "Xã An Long",           DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 14 },
            new Ward { WardId = "W_TRUVANTH_C14",    WardName = "Xã Trừ Văn Thố",      DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 14 },
            new Ward { WardId = "W_BAUBAN_C14",      WardName = "Xã Bàu Bàng",         DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 14 },
            new Ward { WardId = "W_LONGHOA_C14",     WardName = "Xã Long Hòa",         DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 14 },
            new Ward { WardId = "W_THANGAN_C14",     WardName = "Xã Thanh An",         DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 14 },
            new Ward { WardId = "W_DAUTIENG_C14",    WardName = "Xã Dầu Tiếng",        DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 14 },
            new Ward { WardId = "W_MINHTHANH_C14",   WardName = "Xã Minh Thạnh",       DistrictName = "Bình Dương (sáp nhập)", ClusterNumber = 14 },

            // ===== CỤM 15 - Bà Rịa - Vũng Tàu (nội địa + Côn Đảo) =====
            new Ward { WardId = "W_CONDAO_C15",      WardName = "Đặc khu Côn Đảo",     DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 15 },
            new Ward { WardId = "W_LONGSON_C15",     WardName = "Xã Long Sơn",         DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 15 },
            new Ward { WardId = "W_CHAUPHA_C15",     WardName = "Xã Châu Pha",         DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 15 },
            new Ward { WardId = "W_NGAIGIAO_C15",    WardName = "Xã Ngãi Giao",        DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 15 },
            new Ward { WardId = "W_BINHGIA_C15",     WardName = "Xã Bình Giã",         DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 15 },
            new Ward { WardId = "W_KIMLONG_C15",     WardName = "Xã Kim Long",         DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 15 },
            new Ward { WardId = "W_CHAUDUC_C15",     WardName = "Xã Châu Đức",         DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 15 },
            new Ward { WardId = "W_NGHIATHANH_C15",  WardName = "Xã Nghĩa Thành",      DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 15 },
            new Ward { WardId = "W_XUANSON_C15",     WardName = "Xã Xuân Sơn",         DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 15 },

            // ===== CỤM 16 - Bà Rịa - Vũng Tàu (ven biển) =====
            new Ward { WardId = "W_HOTRAM_C16",      WardName = "Xã Hồ Tràm",          DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 16 },
            new Ward { WardId = "W_LONGDIEN_C16",    WardName = "Xã Long Điền",        DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 16 },
            new Ward { WardId = "W_XUYENMOC_C16",    WardName = "Xã Xuyên Mộc",        DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 16 },
            new Ward { WardId = "W_HOAHOI_C16",      WardName = "Xã Hòa Hội",          DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 16 },
            new Ward { WardId = "W_BAULAM_C16",      WardName = "Xã Bàu Lâm",          DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 16 },
            new Ward { WardId = "W_HOAHIEP_C16",     WardName = "Xã Hòa Hiệp",         DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 16 },
            new Ward { WardId = "W_BINHCHAU_C16",    WardName = "Xã Bình Châu",        DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 16 },
            new Ward { WardId = "W_DATDO_C16",       WardName = "Xã Đất Đỏ",           DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 16 },
            new Ward { WardId = "W_PHUOCHAI_C16",    WardName = "Xã Phước Hải",        DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 16 },
            new Ward { WardId = "W_LONGHAI_C16",     WardName = "Xã Long Hải",         DistrictName = "Bà Rịa - Vũng Tàu (sáp nhập)", ClusterNumber = 16 },
        };

        // Chỉ giữ danh sách phường thuộc cụm 1, 6, 8 theo yêu cầu.
        wards = wards
            .Where(w => w.ClusterNumber is 1 or 6 or 8)
            .Select(w =>
            {
                w.DistrictName = $"Cụm {w.ClusterNumber}";
                return w;
            })
            .ToArray();

        Console.WriteLine("🏘️ Đồng bộ danh mục Ward theo dữ liệu sáp nhập...");

        // Xóa các phường cũ không còn nằm trong danh sách cụm 1, 6, 8.
        var expectedWardIds = wards.Select(w => w.WardId).ToHashSet();
        var staleWardIds = await context.Wards
            .Where(w => !expectedWardIds.Contains(w.WardId))
            .Select(w => w.WardId)
            .ToListAsync();

        if (staleWardIds.Count > 0)
        {
            await context.Cameras
                .Where(c => c.WardId != null && staleWardIds.Contains(c.WardId))
                .ExecuteUpdateAsync(setters => setters.SetProperty(c => c.WardId, (string?)null));

            await context.AlertSubscriptions
                .Where(s => s.WardId != null && staleWardIds.Contains(s.WardId))
                .ExecuteUpdateAsync(setters => setters.SetProperty(s => s.WardId, (string?)null));

            var staleWards = await context.Wards.Where(w => staleWardIds.Contains(w.WardId)).ToListAsync();
            context.Wards.RemoveRange(staleWards);
            await context.SaveChangesAsync();
            Console.WriteLine($"🧹 Đã xóa {staleWards.Count} phường ngoài cụm 1, 6, 8.");
        }

        var wardMap = await context.Wards.ToDictionaryAsync(w => w.WardId, w => w);
        var addedWardCount = 0;
        var updatedWardCount = 0;
        foreach (var ward in wards)
        {
            if (!wardMap.TryGetValue(ward.WardId, out var existingWard))
            {
                await context.Wards.AddAsync(ward);
                addedWardCount++;
                continue;
            }

            if (existingWard.WardName != ward.WardName ||
                existingWard.DistrictName != ward.DistrictName ||
                existingWard.Alias != ward.Alias ||
                existingWard.ClusterNumber != ward.ClusterNumber)
            {
                existingWard.WardName = ward.WardName;
                existingWard.DistrictName = ward.DistrictName;
                existingWard.Alias = ward.Alias;
                existingWard.ClusterNumber = ward.ClusterNumber;
                existingWard.UpdatedAt = DateTime.UtcNow;
                updatedWardCount++;
            }
        }

        if (addedWardCount > 0 || updatedWardCount > 0)
        {
            await context.SaveChangesAsync();
            Console.WriteLine($"✅ Ward: thêm mới {addedWardCount}, cập nhật {updatedWardCount}.");
        }

        // 2. Seed Cameras (Nếu chưa có)
        if (!context.Cameras.Any())
        {
            Console.WriteLine("📷 Đang thêm dữ liệu Camera mẫu...");
            var cameras = new[]
            {
                // ===============================================
                // HƯỚNG DẪN LẤY URL CAMERA THẬT:
                // 1. Vào: http://giaothong.hochiminhcity.gov.vn
                // 2. Click vào bản đồ, chọn camera
                // 3. Chuột phải vào ảnh → "Open image in new tab"
                // 4. Copy URL có dạng: .../ImageHandler.ashx?id=...
                // ===============================================
                
                // Camera thật từ hệ thống giao thông TP.HCM (thay ?id=... bằng ID thật)
                new Camera 
                { 
                    Id = "CAM_TD_001", 
                    Name = "Đường số 1 - Song hành XLHN",
                    Latitude = 10.8216, 
                    Longitude = 106.7776,
                    WardId = "W_THUDUC_C06",
                    Status = nameof(CameraStatus.Active)
                },
                new Camera 
                { 
                    Id = "CAM_TD_002", 
                    Name = "Quốc lộ 1 - KCX Linh Trung 1",
                    Latitude = 10.8737, 
                    Longitude = 106.7791,
                    WardId = "W_LINHXUAN_C08",
                    Status = nameof(CameraStatus.Active)
                },
                new Camera 
                { 
                    Id = "CAM_TB_001", 
                    Name = "Cộng Hòa - Út Tịch",
                    Latitude = 10.8015, 
                    Longitude = 106.6578,
                    WardId = "W_TANSONNHAT_C04",
                    Status = nameof(CameraStatus.Active)
                },
                new Camera 
                { 
                    Id = "CAM_Q6_001", 
                    Name = "Hậu Giang - Nguyễn Văn Luông (Vòng xoay Phú Lâm)",
                    Latitude = 10.7483, 
                    Longitude = 106.6356,
                    WardId = "W_PHULAM_C03",
                    Status = nameof(CameraStatus.Active)
                },
                new Camera 
                { 
                    Id = "CAM_Q3_001", 
                    Name = "Cách Mạng Tháng 8 - Đỗ Thị Lời",
                    Latitude = 10.7820, 
                    Longitude = 106.6847,
                    WardId = "W_NHIEULOC_C01",
                    Status = nameof(CameraStatus.Active)
                },
                new Camera 
                { 
                    Id = "CAM_Q1_001", 
                    Name = "Đinh Tiên Hoàng - Võ Thị Sáu",
                    Latitude = 10.7900, 
                    Longitude = 106.7003,
                    WardId = "W_TANDINH_C01",
                    Status = nameof(CameraStatus.Active)
                },
                new Camera 
                { 
                    Id = "CAM_Q1_002", 
                    Name = "Nguyễn Thị Minh Khai - Nguyễn Bỉnh Khiêm",
                    Latitude = 10.7879, 
                    Longitude = 106.7034,
                    WardId = "W_SAIGON_C01",
                    Status = nameof(CameraStatus.Active)
                },
                new Camera 
                { 
                    Id = "CAM_Q10_001", 
                    Name = "Ba Tháng Hai - Sư Vạn Hạnh",
                    Latitude = 10.7712, 
                    Longitude = 106.6676,
                    WardId = "W_HOAHUNG_C01",
                    Status = nameof(CameraStatus.Active)
                },
                new Camera 
                { 
                    Id = "CAM_BT_001", 
                    Name = "Nguyễn Hữu Cảnh - Ngô Tất Tố",
                    Latitude = 10.7940, 
                    Longitude = 106.7192,
                    WardId = "W_THANHMYTAY_C06",
                    Status = nameof(CameraStatus.Active)
                },
                new Camera 
                { 
                    Id = "CAM_BT_002", 
                    Name = "Lê Văn Duyệt - Vũ Huy Tấn",
                    Latitude = 10.7991, 
                    Longitude = 106.6958,
                    WardId = "W_GIADINH_C06",
                    Status = nameof(CameraStatus.Active)
                },
                // Camera TEST MODE (fallback khi không có camera thật)
                new Camera 
                { 
                    Id = "CAM_TEST_01", 
                    Name = "Camera Test Mode (Bến Thành)",
                    Latitude = 10.762622, 
                    Longitude = 106.660172,
                    WardId = "W_BENTHANH_C01",
                    Status = nameof(CameraStatus.Active)
                }
            };
            await context.Cameras.AddRangeAsync(cameras);
            await context.SaveChangesAsync();
            Console.WriteLine($"✅ Đã thêm {cameras.Length} cameras.");
            
            // Tạo CameraStream cho mỗi camera
            var streams = new[]
            {
                new CameraStream { CameraId = "CAM_TD_001", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=5896ddb359f14b001221f707", StreamType = "Snapshot", IsPrimary = true, IsActive = true },
                new CameraStream { CameraId = "CAM_TD_002", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=5896ddb359f14b001221f708", StreamType = "Snapshot", IsPrimary = true, IsActive = true },
                new CameraStream { CameraId = "CAM_TB_001", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=5896ddb359f14b001221f709", StreamType = "Snapshot", IsPrimary = true, IsActive = true },
                new CameraStream { CameraId = "CAM_Q6_001", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=5896ddb359f14b001221f70a", StreamType = "Snapshot", IsPrimary = true, IsActive = true },
                new CameraStream { CameraId = "CAM_Q3_001", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=5896ddb359f14b001221f70b", StreamType = "Snapshot", IsPrimary = true, IsActive = true },
                new CameraStream { CameraId = "CAM_Q1_001", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=5896ddb359f14b001221f70c", StreamType = "Snapshot", IsPrimary = true, IsActive = true },
                new CameraStream { CameraId = "CAM_Q1_002", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=5896ddb359f14b001221f70d", StreamType = "Snapshot", IsPrimary = true, IsActive = true },
                new CameraStream { CameraId = "CAM_Q10_001", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=5896ddb359f14b001221f70e", StreamType = "Snapshot", IsPrimary = true, IsActive = true },
                new CameraStream { CameraId = "CAM_BT_001", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=5896ddb359f14b001221f70f", StreamType = "Snapshot", IsPrimary = true, IsActive = true },
                new CameraStream { CameraId = "CAM_BT_002", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=5896ddb359f14b001221f710", StreamType = "Snapshot", IsPrimary = true, IsActive = true },
                new CameraStream { CameraId = "CAM_TEST_01", StreamUrl = AppConstants.Camera.TestModeUrl, StreamType = "Test", IsPrimary = true, IsActive = true }
            };
            await context.CameraStreams.AddRangeAsync(streams);
            await context.SaveChangesAsync();
            Console.WriteLine($"✅ Đã thêm {streams.Length} camera streams.");
        }

        // 2.1 Đồng bộ WardId cho camera đã tồn tại theo dữ liệu chuẩn
        var cameraWardMap = new Dictionary<string, string>
        {
            // Camera IDs mới (QĐ2913 - ward IDs dạng _CXX)
            ["CAM_TD_001"] = "W_THUDUC_C06",
            ["CAM_TD_002"] = "W_LINHXUAN_C08",
            ["CAM_TB_001"] = "W_TANSONNHAT_C04",
            ["CAM_Q6_001"] = "W_PHULAM_C03",
            ["CAM_Q3_001"] = "W_NHIEULOC_C01",
            ["CAM_Q1_001"] = "W_TANDINH_C01",
            ["CAM_Q1_002"] = "W_SAIGON_C01",
            ["CAM_Q10_001"] = "W_HOAHUNG_C01",
            ["CAM_BT_001"] = "W_THANHMYTAY_C06",
            ["CAM_BT_002"] = "W_GIADINH_C06",
            ["CAM_TEST_01"] = "W_BENTHANH_C01",

            // Legacy IDs / IDs dữ liệu thực tế đang có trong DB
            ["CAM_TAN_BINH_001"] = "W_TANSONNHAT_C04",
            ["CAM_TANBINH_001"] = "W_TANSONNHAT_C04",
            ["CAM_BINHTAN_001"] = "W_PHULAM_C03",
            ["CAM_BINHTHANH_001"] = "W_GIADINH_C06",
            ["CAM_BINHTHANH_002"] = "W_THANHMYTAY_C06",
            ["CAM_QUAN10_001"] = "W_HOAHUNG_C01",
            ["CAM_QUAN1_002"] = "W_SAIGON_C01",
            ["CAM_QUAN3_001"] = "W_TANDINH_C01",
            ["CAM_QUAN3_002"] = "W_NHIEULOC_C01",
            ["CAM_QUAN6_001"] = "W_PHULAM_C03",
            ["CAM_THUDUC_001"] = "W_LINHXUAN_C08",
            ["CAM_THUDUC_002"] = "W_THUDUC_C06",
            ["CAM_THUDUC_006"] = "W_LINHXUAN_C08"
        };

        // Fallback theo tên camera để hỗ trợ dữ liệu cũ có ID khác
        var cameraNameWardRules = new Dictionary<string, string>
        {
            ["song hành xlh"] = "W_THUDUC_C06",
            ["song hanh xlh"] = "W_THUDUC_C06",
            ["quốc lộ 1 - kcx linh trung 1"] = "W_LINHXUAN_C08",
            ["quoc lo 1 - kcx linh trung 1"] = "W_LINHXUAN_C08",
            ["ngã ba linh xuân"] = "W_LINHXUAN_C08",
            ["nga ba linh xuan"] = "W_LINHXUAN_C08",
            ["cộng hòa - út tịch"] = "W_TANSONNHAT_C04",
            ["cong hoa - ut tich"] = "W_TANSONNHAT_C04",
            ["cộng hòa -út tích"] = "W_TANSONNHAT_C04",
            ["cong hoa -ut tich"] = "W_TANSONNHAT_C04",
            ["cong hoa -ut tich 2"] = "W_TANSONNHAT_C04",
            ["cộng hòa -út tích 2"] = "W_TANSONNHAT_C04",
            ["hậu giang - nguyễn văn luông"] = "W_PHULAM_C03",
            ["hau giang - nguyen van luong"] = "W_PHULAM_C03",
            ["cách mạng tháng 8 - đỗ thị lời"] = "W_NHIEULOC_C01",
            ["cach mang thang 8 - do thi loi"] = "W_NHIEULOC_C01",
            ["đinh tiên hoàng - võ thị sáu"] = "W_TANDINH_C01",
            ["dinh tien hoang - vo thi sau"] = "W_TANDINH_C01",
            ["nguyễn thị minh khai - nguyễn bỉnh khiêm"] = "W_SAIGON_C01",
            ["nguyen thi minh khai - nguyen binh khiem"] = "W_SAIGON_C01",
            ["ba tháng hai - sư vạn hạnh"] = "W_HOAHUNG_C01",
            ["ba thang hai - su van hanh"] = "W_HOAHUNG_C01",
            ["nguyễn hữu cảnh - ngô tất tố"] = "W_THANHMYTAY_C06",
            ["nguyen huu canh - ngo tat to"] = "W_THANHMYTAY_C06",
            ["lê văn duyệt - vũ huy tấn"] = "W_GIADINH_C06",
            ["le van duyet - vu huy tan"] = "W_GIADINH_C06"
        };

        // 2.2 Seed/Upsert camera thực tế cho Cụm 1 theo danh sách do người dùng cung cấp
        // Nguồn: Cổng thông tin giao thông TP.HCM (camId từ URL expandcameraplayer + videoUrl)
        var cluster1TrafficCameraSeeds = new[]
        {
            new { Id = "CAM_GT_662b85bf1afb9c00172dd149", Name = "Nguyễn Hữu Cảnh - Tôn Đức Thắng", WardId = "W_SAIGON_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=662b85bf1afb9c00172dd149" },
            new { Id = "CAM_GT_58af994abd82540010390c37", Name = "Nam Kỳ Khởi Nghĩa - Hàm Nghi", WardId = "W_SAIGON_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=58af994abd82540010390c37" },
            new { Id = "CAM_GT_662b857b1afb9c00172dd106", Name = "Điện Biên Phủ - Nguyễn Bỉnh Khiêm", WardId = "W_SAIGON_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=662b857b1afb9c00172dd106" },

            new { Id = "CAM_GT_662b82a61afb9c00172dcdfd", Name = "Trần Quang Khải - Trần Nhật Duật", WardId = "W_TANDINH_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=662b82a61afb9c00172dcdfd" },
            new { Id = "CAM_GT_5a823e425058170011f6eaa4", Name = "Đinh Tiên Hoàng - Võ Thị Sáu", WardId = "W_TANDINH_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=5a823e425058170011f6eaa4" },
            new { Id = "CAM_GT_662b80721afb9c00172dcb28", Name = "Nguyễn Văn Thủ - Trần Doãn Khanh", WardId = "W_TANDINH_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=662b80721afb9c00172dcb28" },

            new { Id = "CAM_GT_662b7ce71afb9c00172dc676", Name = "CMT8 - Bùi Thị Xuân", WardId = "W_BENTHANH_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=662b7ce71afb9c00172dc676" },
            new { Id = "CAM_GT_56de42f611f398ec0c481288", Name = "Võ Văn Kiệt - Cầu Ông Lãnh", WardId = "W_BENTHANH_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=56de42f611f398ec0c481288" },

            new { Id = "CAM_GT_63195512c9eae60017a1c279", Name = "Nguyễn Trãi - Cống Quỳnh", WardId = "W_CAUONGLANHC01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=63195512c9eae60017a1c279" },
            new { Id = "CAM_GT_662b811d1afb9c00172dcc1d", Name = "Trần Hưng Đạo - Nguyễn Cư Trinh", WardId = "W_CAUONGLANHC01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=662b811d1afb9c00172dcc1d" },

            new { Id = "CAM_GT_6623e3ea6f998a001b2522ae", Name = "Nguyễn Đình Chiểu - Cao Thắng", WardId = "W_BANCO_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=6623e3ea6f998a001b2522ae" },
            new { Id = "CAM_GT_63ae75f9bfd3d90017e8f097", Name = "Cao Thắng - Võ Văn Tần", WardId = "W_BANCO_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=63ae75f9bfd3d90017e8f097" },

            new { Id = "CAM_GT_662b82da1afb9c00172dce94", Name = "Võ Thị Sáu - Nguyễn Hữu Cầu", WardId = "W_XUANHOA_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=662b82da1afb9c00172dce94" },
            new { Id = "CAM_GT_5deb576d1dc17d7c5515acfb", Name = "Võ Thị Sáu - Bà Huyện Thanh Quan", WardId = "W_XUANHOA_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=5deb576d1dc17d7c5515acfb" },
            new { Id = "CAM_GT_5deb576d1dc17d7c5515acfc", Name = "Điện Biên Phủ - Trương Định", WardId = "W_XUANHOA_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=5deb576d1dc17d7c5515acfc" },

            new { Id = "CAM_GT_6623e5776f998a001b252337", Name = "Trần Quang Diệu - Trường Sa", WardId = "W_NHIEULOC_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=6623e5776f998a001b252337" },
            new { Id = "CAM_GT_5d8cd4ee766c880017188946", Name = "Lê Văn Sỹ - Huỳnh Văn Bánh", WardId = "W_NHIEULOC_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=5d8cd4ee766c880017188946" },

            new { Id = "CAM_GT_5deb576d1dc17d7c5515ad23", Name = "3/2 - Lý Thường Kiệt", WardId = "W_DIENHONG_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=5deb576d1dc17d7c5515ad23" },
            new { Id = "CAM_GT_63ae7c53bfd3d90017e8f3d8", Name = "Lý Thường Kiệt - Tô Hiến Thành", WardId = "W_DIENHONG_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=63ae7c53bfd3d90017e8f3d8" },
            new { Id = "CAM_GT_66b1c34d779f74001867409e", Name = "3/2 - Thành Thái", WardId = "W_DIENHONG_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=66b1c34d779f74001867409e" },

            new { Id = "CAM_GT_6623e6b86f998a001b2523b8", Name = "Lý Thái Tổ - Hồ Thị Kỷ", WardId = "W_VUONLAI_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=6623e6b86f998a001b2523b8" },
            new { Id = "CAM_GT_6623e7076f998a001b2523ea", Name = "Lý Thái Tổ - Sư Vạn Hạnh", WardId = "W_VUONLAI_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=6623e7076f998a001b2523ea" },
            new { Id = "CAM_GT_66b1c158779f740018673eb4", Name = "Hùng Vương - Lê Hồng Phong", WardId = "W_VUONLAI_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=66b1c158779f740018673eb4" },

            new { Id = "CAM_GT_6623e7526f998a001b252407", Name = "3/2 - Cầu vượt Nguyễn Tri Phương", WardId = "W_HOAHUNG_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=6623e7526f998a001b252407" },
            new { Id = "CAM_GT_631955e7c9eae60017a1c30a", Name = "CMT8 - Hòa Hưng", WardId = "W_HOAHUNG_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=631955e7c9eae60017a1c30a" },
            new { Id = "CAM_GT_63ae7a08bfd3d90017e8f285", Name = "3/2 - Lê Hồng Phong", WardId = "W_HOAHUNG_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=63ae7a08bfd3d90017e8f285" },
            new { Id = "CAM_GT_56de42f611f398ec0c481284", Name = "Nguyễn Thị Minh Khai - Nguyễn Thiện Thuật", WardId = "W_HOAHUNG_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=56de42f611f398ec0c481284" },
            new { Id = "CAM_GT_58af8eb2bd82540010390c30", Name = "Nam Kỳ Khởi Nghĩa - Nguyễn Thị Minh Khai", WardId = "W_HOAHUNG_C01", StreamUrl = "http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id=58af8eb2bd82540010390c30" }
        };

        static string BuildImageHandlerUrl(string cameraId)
        {
            const string prefix = "CAM_GT_";
            if (cameraId.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            {
                var camId = cameraId.Substring(prefix.Length);
                return $"http://giaothong.hochiminhcity.gov.vn/render/ImageHandler.ashx?id={camId}";
            }

            return cameraId;
        }

        cluster1TrafficCameraSeeds = cluster1TrafficCameraSeeds
            .Select(x => new { x.Id, x.Name, x.WardId, StreamUrl = BuildImageHandlerUrl(x.Id) })
            .ToArray();

        var cluster1CameraIds = cluster1TrafficCameraSeeds.Select(x => x.Id).ToHashSet();
        var existingCameraById = await context.Cameras.ToDictionaryAsync(c => c.Id, c => c);
        const double defaultCluster1Lat = 10.7769;
        const double defaultCluster1Lng = 106.7009;
        
        // Coordinates from ArcGIS geocoding (validated coordinates from Google Maps-aligned intersections)
        var cluster1CoordinateMap = new Dictionary<string, (double Lat, double Lon)>
        {
            { "CAM_GT_662b85bf1afb9c00172dd149", (10.7896463, 106.7110733) },
            { "CAM_GT_58af994abd82540010390c37", (10.7752395, 106.6993105) },
            { "CAM_GT_662b857b1afb9c00172dd106", (10.7992510, 106.7086262) },
            { "CAM_GT_662b82a61afb9c00172dcdfd", (10.7941252, 106.6933816) },
            { "CAM_GT_5a823e425058170011f6eaa4", (10.780938, 106.688113) },
            { "CAM_GT_662b80721afb9c00172dcb28", (10.783141, 106.725334) },
            { "CAM_GT_662b7ce71afb9c00172dc676", (10.7711437, 106.6894327) },
            { "CAM_GT_56de42f611f398ec0c481288", (10.7639164, 106.6981783) },
            { "CAM_GT_63195512c9eae60017a1c279", (10.7704753, 106.6920711) },
            { "CAM_GT_662b811d1afb9c00172dcc1d", (10.7588163, 106.6872751) },
            { "CAM_GT_6623e3ea6f998a001b2522ae", (10.7681435, 106.6816726) },
            { "CAM_GT_63ae75f9bfd3d90017e8f097", (10.7737164, 106.6295629) },
            { "CAM_GT_662b82da1afb9c00172dce94", (10.780938, 106.688113) },
            { "CAM_GT_5deb576d1dc17d7c5515acfb", (10.7763645, 106.6889029) },
            { "CAM_GT_5deb576d1dc17d7c5515acfc", (10.7992510, 106.7086262) },
            { "CAM_GT_6623e5776f998a001b252337", (10.7901116, 106.6802649) },
            { "CAM_GT_5d8cd4ee766c880017188946", (10.7941935, 106.6822919) },
            { "CAM_GT_5deb576d1dc17d7c5515ad23", (10.7791315, 106.6559763) },
            { "CAM_GT_63ae7c53bfd3d90017e8f3d8", (10.7823769, 106.6700049) },
            { "CAM_GT_66b1c34d779f74001867409e", (10.4, 106.93333) },
            { "CAM_GT_6623e6b86f998a001b2523b8", (10.7665194, 106.6780171) },
            { "CAM_GT_6623e7076f998a001b2523ea", (10.86785, 106.613) },
            { "CAM_GT_66b1c158779f740018673eb4", (10.7623969, 106.6765036) },
            { "CAM_GT_6623e7526f998a001b252407", (10.7676864, 106.6670970) },
            { "CAM_GT_631955e7c9eae60017a1c30a", (10.7807464, 106.6763326) },
            { "CAM_GT_63ae7a08bfd3d90017e8f285", (10.8006915, 106.6078275) },
            { "CAM_GT_56de42f611f398ec0c481284", (10.7668841, 106.6774396) },
            { "CAM_GT_58af8eb2bd82540010390c30", (10.7894684, 106.7037653) }
        };
        
        var insertedCluster1CameraCount = 0;
        var updatedCluster1CameraCount = 0;

        foreach (var seed in cluster1TrafficCameraSeeds)
        {
            var (lat, lon) = cluster1CoordinateMap.TryGetValue(seed.Id, out var coords) 
                ? coords 
                : (defaultCluster1Lat, defaultCluster1Lng);
                
            if (!existingCameraById.TryGetValue(seed.Id, out var existingCam))
            {
                await context.Cameras.AddAsync(new Camera
                {
                    Id = seed.Id,
                    Name = seed.Name,
                    Latitude = lat,
                    Longitude = lon,
                    WardId = seed.WardId,
                    Status = nameof(CameraStatus.Active)
                });
                insertedCluster1CameraCount++;
                continue;
            }

            var cameraChanged = false;
            if (existingCam.Name != seed.Name)
            {
                existingCam.Name = seed.Name;
                cameraChanged = true;
            }

            if (existingCam.WardId != seed.WardId)
            {
                existingCam.WardId = seed.WardId;
                cameraChanged = true;
            }

            if (existingCam.Status != nameof(CameraStatus.Active))
            {
                existingCam.Status = nameof(CameraStatus.Active);
                cameraChanged = true;
            }
            
            // Update coordinates if available from geocoding
            var (newLat, newLon) = cluster1CoordinateMap.TryGetValue(seed.Id, out var newCoords) 
                ? newCoords 
                : (existingCam.Latitude, existingCam.Longitude);
            
            if (Math.Abs(existingCam.Latitude - newLat) > 0.0001 || Math.Abs(existingCam.Longitude - newLon) > 0.0001)
            {
                existingCam.Latitude = newLat;
                existingCam.Longitude = newLon;
                cameraChanged = true;
            }

            if (cameraChanged)
            {
                updatedCluster1CameraCount++;
            }
        }

        if (insertedCluster1CameraCount > 0 || updatedCluster1CameraCount > 0)
        {
            await context.SaveChangesAsync();
            Console.WriteLine($"✅ Cụm 1: thêm {insertedCluster1CameraCount} camera, cập nhật {updatedCluster1CameraCount} camera.");
        }

        var existingPrimaryStreams = await context.CameraStreams
            .Where(s => cluster1CameraIds.Contains(s.CameraId) && s.IsPrimary)
            .ToDictionaryAsync(s => s.CameraId, s => s);

        var insertedCluster1StreamCount = 0;
        var updatedCluster1StreamCount = 0;
        foreach (var seed in cluster1TrafficCameraSeeds)
        {
            var targetStreamType = seed.StreamUrl.Contains(".m3u8", StringComparison.OrdinalIgnoreCase) ? "HLS" : "Snapshot";

            if (!existingPrimaryStreams.TryGetValue(seed.Id, out var stream))
            {
                await context.CameraStreams.AddAsync(new CameraStream
                {
                    CameraId = seed.Id,
                    StreamUrl = seed.StreamUrl,
                    StreamType = targetStreamType,
                    IsPrimary = true,
                    IsActive = true
                });
                insertedCluster1StreamCount++;
                continue;
            }

            var streamChanged = false;
            if (stream.StreamUrl != seed.StreamUrl)
            {
                stream.StreamUrl = seed.StreamUrl;
                streamChanged = true;
            }

            if (stream.StreamType != targetStreamType)
            {
                stream.StreamType = targetStreamType;
                streamChanged = true;
            }

            if (!stream.IsActive)
            {
                stream.IsActive = true;
                streamChanged = true;
            }

            if (streamChanged)
            {
                updatedCluster1StreamCount++;
            }
        }

        if (insertedCluster1StreamCount > 0 || updatedCluster1StreamCount > 0)
        {
            await context.SaveChangesAsync();
            Console.WriteLine($"✅ Cụm 1: thêm {insertedCluster1StreamCount} luồng camera, cập nhật {updatedCluster1StreamCount} luồng camera.");
        }

        // ========================================
        // CLUSTER 6 - Khu Bình Thạnh - Gò Vấp
        // ========================================
        var cluster6TrafficCameraSeeds = new[]
        {
            new { Id = "CAM_GT_58affc6017139d0010f35cc8", Name = "Phạm Văn Đồng - QL13", WardId = "W_HIEPBINH_C06", StreamUrl = "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8" },
            new { Id = "CAM_GT_56df8198c062921100c143dd", Name = "Nút giao Thủ Đức - Võ Văn Ngân", WardId = "W_THUDUC_C06", StreamUrl = "http://125.234.114.126:11984/api/stream.m3u8?src=Nút%20giao%20Thủ%20Đức%203" },
            new { Id = "CAM_GT_662b558c1afb9c00172d8ed2", Name = "625 Quang Trung", WardId = "W_GOVAP_C06", StreamUrl = "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8" },
            new { Id = "CAM_GT_5a6066608576340017d06617", Name = "Quang Trung - Tân Sơn", WardId = "W_THONGTAYHOI_C06", StreamUrl = "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8" },
            new { Id = "CAM_GT_587ee0ecb807da0011e33d50", Name = "Phan Đăng Lưu - Lê Văn Duyệt", WardId = "W_GIADINH_C06", StreamUrl = "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8" },
            new { Id = "CAM_GT_63b66089bfd3d90017eaa4bd", Name = "Nơ Trang Long - Chu Văn An", WardId = "W_BINHTHANH_C06", StreamUrl = "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8" },
            new { Id = "CAM_GT_58d7c20ac1e33c00112b321c", Name = "Phạm Văn Đồng - Phan Văn Trị 2", WardId = "W_BINHLOITRUNG_C06", StreamUrl = "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8" },
            new { Id = "CAM_GT_63b65f8dbfd3d90017eaa434", Name = "Cầu Thị Nghè - Xô Viết Nghệ Tính", WardId = "W_THANHMYTAY_C06", StreamUrl = "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8" },
            new { Id = "CAM_GT_5a8254f25058170011f6eac5", Name = "Xô Viết Nghệ Tính - Nguyễn Xí 2", WardId = "W_BINHQUOI_C06", StreamUrl = "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8" }
        };

        cluster6TrafficCameraSeeds = cluster6TrafficCameraSeeds
            .Select(x => new { x.Id, x.Name, x.WardId, StreamUrl = BuildImageHandlerUrl(x.Id) })
            .ToArray();

        var cluster6CameraIds = cluster6TrafficCameraSeeds.Select(x => x.Id).ToHashSet();
        const double defaultCluster6Lat = 10.8090;
        const double defaultCluster6Lng = 106.7100;
        
        var cluster6CoordinateMap = new Dictionary<string, (double Lat, double Lon)>
        {
            // Phường Hiệp Bình - Phạm Văn Đồng - QL13
            { "CAM_GT_58affc6017139d0010f35cc8", (10.8159, 106.7265) },
            // Phường Thủ Đức - Nút giao (Võ Văn Ngân)
            { "CAM_GT_56df8198c062921100c143dd", (10.8035, 106.7422) },
            // Phường Gò Vấp - 625 Quang Trung
            { "CAM_GT_662b558c1afb9c00172d8ed2", (10.8164, 106.6931) },
            // Phường Thông Tây Hội - Quang Trung - Tân Sơn
            { "CAM_GT_5a6066608576340017d06617", (10.8085, 106.6913) },
            // Phường Gia Định - Phan Đăng Lưu - Lê Văn Duyệt
            { "CAM_GT_587ee0ecb807da0011e33d50", (10.7992, 106.7158) },
            // Phường Bình Thạnh - Nơ Trang Long - Chu Văn An
            { "CAM_GT_63b66089bfd3d90017eaa4bd", (10.7821, 106.7497) },
            // Phường Bình Lợi Trung - Phạm Văn Đồng - Phan Văn Trị 2
            { "CAM_GT_58d7c20ac1e33c00112b321c", (10.8111, 106.7335) },
            // Phường Thạnh Mỹ Tây - Cầu Thị Nghè (Xô Viết Nghệ Tính - Phan Văn Hân)
            { "CAM_GT_63b65f8dbfd3d90017eaa434", (10.7945, 106.7510) },
            // Phường Bình Quới - Xô Viết Nghệ Tính - Nguyễn Xí 2
            { "CAM_GT_5a8254f25058170011f6eac5", (10.8194, 106.7628) }
        };

        var insertedCluster6CameraCount = 0;
        var updatedCluster6CameraCount = 0;

        foreach (var seed in cluster6TrafficCameraSeeds)
        {
            var (lat, lon) = cluster6CoordinateMap.TryGetValue(seed.Id, out var coords) 
                ? coords 
                : (defaultCluster6Lat, defaultCluster6Lng);
                
            if (!existingCameraById.TryGetValue(seed.Id, out var existingCam))
            {
                await context.Cameras.AddAsync(new Camera
                {
                    Id = seed.Id,
                    Name = seed.Name,
                    Latitude = lat,
                    Longitude = lon,
                    WardId = seed.WardId,
                    Status = nameof(CameraStatus.Active)
                });
                insertedCluster6CameraCount++;
                existingCameraById[seed.Id] = new Camera { Id = seed.Id };
                continue;
            }

            var cameraChanged = false;
            if (existingCam.Name != seed.Name)
            {
                existingCam.Name = seed.Name;
                cameraChanged = true;
            }

            if (existingCam.WardId != seed.WardId)
            {
                existingCam.WardId = seed.WardId;
                cameraChanged = true;
            }

            if (existingCam.Status != nameof(CameraStatus.Active))
            {
                existingCam.Status = nameof(CameraStatus.Active);
                cameraChanged = true;
            }
            
            var (newLat, newLon) = cluster6CoordinateMap.TryGetValue(seed.Id, out var newCoords) 
                ? newCoords 
                : (existingCam.Latitude, existingCam.Longitude);
            
            if (Math.Abs(existingCam.Latitude - newLat) > 0.0001 || Math.Abs(existingCam.Longitude - newLon) > 0.0001)
            {
                existingCam.Latitude = newLat;
                existingCam.Longitude = newLon;
                cameraChanged = true;
            }

            if (cameraChanged)
            {
                updatedCluster6CameraCount++;
            }
        }

        if (insertedCluster6CameraCount > 0 || updatedCluster6CameraCount > 0)
        {
            await context.SaveChangesAsync();
            Console.WriteLine($"✅ Cụm 6: thêm {insertedCluster6CameraCount} camera, cập nhật {updatedCluster6CameraCount} camera.");
        }

        var existingCluster6Streams = await context.CameraStreams
            .Where(s => cluster6CameraIds.Contains(s.CameraId) && s.IsPrimary)
            .ToDictionaryAsync(s => s.CameraId, s => s);

        var insertedCluster6StreamCount = 0;
        var updatedCluster6StreamCount = 0;
        foreach (var seed in cluster6TrafficCameraSeeds)
        {
            var targetStreamType = seed.StreamUrl.Contains(".m3u8", StringComparison.OrdinalIgnoreCase) ? "HLS" : "Snapshot";

            if (!existingCluster6Streams.TryGetValue(seed.Id, out var stream))
            {
                await context.CameraStreams.AddAsync(new CameraStream
                {
                    CameraId = seed.Id,
                    StreamUrl = seed.StreamUrl,
                    StreamType = targetStreamType,
                    IsPrimary = true,
                    IsActive = true
                });
                insertedCluster6StreamCount++;
                continue;
            }

            var streamChanged = false;
            if (stream.StreamUrl != seed.StreamUrl)
            {
                stream.StreamUrl = seed.StreamUrl;
                streamChanged = true;
            }

            if (stream.StreamType != targetStreamType)
            {
                stream.StreamType = targetStreamType;
                streamChanged = true;
            }

            if (!stream.IsActive)
            {
                stream.IsActive = true;
                streamChanged = true;
            }

            if (streamChanged)
            {
                updatedCluster6StreamCount++;
            }
        }

        if (insertedCluster6StreamCount > 0 || updatedCluster6StreamCount > 0)
        {
            await context.SaveChangesAsync();
            Console.WriteLine($"✅ Cụm 6: thêm {insertedCluster6StreamCount} luồng camera, cập nhật {updatedCluster6StreamCount} luồng camera.");
        }

        // ========================================
        // CLUSTER 8 - TP. Thủ Đức
        // ========================================
        var cluster8TrafficCameraSeeds = new[]
        {
            new { Id = "CAM_GT_5990ffdbbec3b90016d2ad2d", Name = "Đầu Hầm TP Thủ Đức - Hầm Thủ Thiêm", WardId = "W_ANKHANH_C08", StreamUrl = "http://125.234.114.126:11984/api/stream.m3u8?src=TTH/60.2%20Đường%20hầm" },
            new { Id = "CAM_GT_587c782db807da0011e33d3b", Name = "Võ Nguyên Giáp - Thảo Điền", WardId = "W_ANKHANH_C08", StreamUrl = "http://125.234.114.126:11984/api/stream.m3u8?src=Xa%20Lộ%20Hà%20Nội%20-%20Thảo%20Điền" },
            new { Id = "CAM_GT_631813ebc9eae60017a196b0", Name = "Cầu Sài Gòn 8 - Thủ Đức", WardId = "W_ANKHANH_C08", StreamUrl = "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8" },
            new { Id = "CAM_GT_6623f1996f998a001b252805", Name = "Mai Chí Thọ - Xa Lộ Hà Nội (3)", WardId = "W_ANKHANH_C08", StreamUrl = "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8" },
            new { Id = "CAM_GT_63b54cffbfd3d90017ea7ad0", Name = "Tỉnh Lộ 43 - Chân Cầu Gò Dưa", WardId = "W_TAMBINH_C08", StreamUrl = "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8" },
            new { Id = "CAM_GT_5d8cd98d766c88001718895a", Name = "Phạm Văn Đồng - Tô Ngọc Vân", WardId = "W_TAMBINH_C08", StreamUrl = "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8" },
            new { Id = "CAM_GT_587461c1b807da0011e33cc8", Name = "Quốc Lộ 1 - Ngã Tư Linh Xuân", WardId = "W_LINHXUAN_C08", StreamUrl = "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8" },
            new { Id = "CAM_GT_586e28a0f9fab7001111b0b3", Name = "Quốc Lộ 1 - KCX Linh Trung 1", WardId = "W_LINHXUAN_C08", StreamUrl = "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8" },
            new { Id = "CAM_GT_6623f1f16f998a001b25281f", Name = "Phạm Văn Đồng - Đào Trinh Nhất", WardId = "W_LINHXUAN_C08", StreamUrl = "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8" },
            new { Id = "CAM_GT_5ad0679598d8fc001102e274", Name = "Lê Văn Việt - Man Thiện", WardId = "W_TANGNHONPHU_C08", StreamUrl = "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8" },
            new { Id = "CAM_GT_56df8159c062921100c143dc", Name = "Ngã Tư Thủ Đức - Lê Văn Việt", WardId = "W_TANGNHONPHU_C08", StreamUrl = "http://125.234.114.126:11984/api/stream.m3u8?src=Nút%20giao%20Thủ%20Đức%201" },
            new { Id = "CAM_GT_63b54a9ebfd3d90017ea7911", Name = "Nguyễn Xiển - Nguyễn Văn Tăng", WardId = "W_TANGNHONPHU_C08", StreamUrl = "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8" },
            new { Id = "CAM_GT_63b54938bfd3d90017ea77f6", Name = "Nguyễn Duy Trinh - Lã Xuân Oai", WardId = "W_LONGTRUONG_C08", StreamUrl = "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8" },
            new { Id = "CAM_GT_56de42f611f398ec0c48129e", Name = "Đồng Văn Cống - Phan Văn Đáng", WardId = "W_CATLAI_C08", StreamUrl = "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8" },
            new { Id = "CAM_GT_56de42f611f398ec0c48129f", Name = "Đồng Văn Cống - Nguyễn Thị Định", WardId = "W_CATLAI_C08", StreamUrl = "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8" },
            new { Id = "CAM_GT_63b54968bfd3d90017ea7808", Name = "Nguyễn Duy Trinh - Đỗ Xuân Hợp", WardId = "W_BINHTRUNG_C08", StreamUrl = "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8" },
            new { Id = "CAM_GT_63b54898bfd3d90017ea77ae", Name = "Nguyễn Duy Trinh - Bưng Ông Thoàn", WardId = "W_BINHTRUNG_C08", StreamUrl = "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8" },
            new { Id = "CAM_GT_63b54996bfd3d90017ea781a", Name = "Đỗ Xuân Hợp - Dương Đình Hội", WardId = "W_PHUOCLONG_C08", StreamUrl = "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8" },
            new { Id = "CAM_GT_56df8274c062921100c143df", Name = "Võ Nguyên Giáp - Tây Hòa 1", WardId = "W_PHUOCLONG_C08", StreamUrl = "http://125.234.114.126:11984/api/stream.m3u8?src=Xa%20Lộ%20Hà%20Nội%20-%20Tây%20Hòa%201" }
        };

        cluster8TrafficCameraSeeds = cluster8TrafficCameraSeeds
            .Select(x => new { x.Id, x.Name, x.WardId, StreamUrl = BuildImageHandlerUrl(x.Id) })
            .ToArray();

        var cluster8CameraIds = cluster8TrafficCameraSeeds.Select(x => x.Id).ToHashSet();
        const double defaultCluster8Lat = 10.8450;
        const double defaultCluster8Lng = 106.7700;
        
        var cluster8CoordinateMap = new Dictionary<string, (double Lat, double Lon)>
        {
            // Phường An Khánh - Đầu hầm TP Thủ Đức - Hầm Thủ Thiêm
            { "CAM_GT_5990ffdbbec3b90016d2ad2d", (10.8005, 106.7625) },
            // Phường An Khánh - Võ Nguyên Giáp - Thảo Điền
            { "CAM_GT_587c782db807da0011e33d3b", (10.8062, 106.7779) },
            // Phường An Khánh - Cầu Sài Gòn 8 - Thủ Đức
            { "CAM_GT_631813ebc9eae60017a196b0", (10.8097, 106.7662) },
            // Phường An Khánh - Mai Chí Thọ - Xa Lộ Hà Nội
            { "CAM_GT_6623f1996f998a001b252805", (10.8173, 106.7856) },
            // Phường Tam Bình - Tỉnh lộ 43 - Chân cầu Gò Dưa
            { "CAM_GT_63b54cffbfd3d90017ea7ad0", (10.8347, 106.7442) },
            // Phường Tam Bình - Phạm Văn Đồng - Tô Ngọc Vân
            { "CAM_GT_5d8cd98d766c88001718895a", (10.8283, 106.7401) },
            // Phường Linh Xuân - Quốc Lộ 1 - Ngã Tư Linh Xuân
            { "CAM_GT_587461c1b807da0011e33cc8", (10.8631, 106.7641) },
            // Phường Linh Xuân - Quốc Lộ 1 - KCX Linh Trung 1
            { "CAM_GT_586e28a0f9fab7001111b0b3", (10.8718, 106.7764) },
            // Phường Linh Xuân - Phạm Văn Đồng - Đào Trinh Nhất
            { "CAM_GT_6623f1f16f998a001b25281f", (10.8720, 106.7413) },
            // Phường Tăng Nhơn Phú - Lê Văn Việt - Man Thiện
            { "CAM_GT_5ad0679598d8fc001102e274", (10.8852, 106.7673) },
            // Phường Tăng Nhơn Phú - Ngã Tư Thủ Đức - Lê Văn Việt
            { "CAM_GT_56df8159c062921100c143dc", (10.8708, 106.7748) },
            // Phường Tăng Nhơn Phú - Nguyễn Xiển - Nguyễn Văn Tăng
            { "CAM_GT_63b54a9ebfd3d90017ea7911", (10.8764, 106.7907) },
            // Phường Long Trường - Nguyễn Duy Trinh - Lã Xuân Oai
            { "CAM_GT_63b54938bfd3d90017ea77f6", (10.8951, 106.7851) },
            // Phường Cát Lái - Đồng Văn Cống - Phan Văn Đáng
            { "CAM_GT_56de42f611f398ec0c48129e", (10.9075, 106.8042) },
            // Phường Cát Lái - Đồng Văn Cống - Nguyễn Thị Định
            { "CAM_GT_56de42f611f398ec0c48129f", (10.9102, 106.8067) },
            // Phường Bình Trưng - Nguyễn Duy Trinh - Đỗ Xuân Hợp
            { "CAM_GT_63b54968bfd3d90017ea7808", (10.9142, 106.7919) },
            // Phường Bình Trưng - Nguyễn Duy Trinh - Bưng Ông Thoàn
            { "CAM_GT_63b54898bfd3d90017ea77ae", (10.9153, 106.8038) },
            // Phường Phước Long - Đỗ Xuân Hợp - Dương Đình Hội
            { "CAM_GT_63b54996bfd3d90017ea781a", (10.9243, 106.8123) },
            // Phường Phước Long - Võ Nguyên Giáp - Tây Hòa 1
            { "CAM_GT_56df8274c062921100c143df", (10.9305, 106.8215) }
        };

        var insertedCluster8CameraCount = 0;
        var updatedCluster8CameraCount = 0;

        foreach (var seed in cluster8TrafficCameraSeeds)
        {
            var (lat, lon) = cluster8CoordinateMap.TryGetValue(seed.Id, out var coords) 
                ? coords 
                : (defaultCluster8Lat, defaultCluster8Lng);
                
            if (!existingCameraById.TryGetValue(seed.Id, out var existingCam))
            {
                await context.Cameras.AddAsync(new Camera
                {
                    Id = seed.Id,
                    Name = seed.Name,
                    Latitude = lat,
                    Longitude = lon,
                    WardId = seed.WardId,
                    Status = nameof(CameraStatus.Active)
                });
                insertedCluster8CameraCount++;
                existingCameraById[seed.Id] = new Camera { Id = seed.Id };
                continue;
            }

            var cameraChanged = false;
            if (existingCam.Name != seed.Name)
            {
                existingCam.Name = seed.Name;
                cameraChanged = true;
            }

            if (existingCam.WardId != seed.WardId)
            {
                existingCam.WardId = seed.WardId;
                cameraChanged = true;
            }

            if (existingCam.Status != nameof(CameraStatus.Active))
            {
                existingCam.Status = nameof(CameraStatus.Active);
                cameraChanged = true;
            }
            
            var (newLat, newLon) = cluster8CoordinateMap.TryGetValue(seed.Id, out var newCoords) 
                ? newCoords 
                : (existingCam.Latitude, existingCam.Longitude);
            
            if (Math.Abs(existingCam.Latitude - newLat) > 0.0001 || Math.Abs(existingCam.Longitude - newLon) > 0.0001)
            {
                existingCam.Latitude = newLat;
                existingCam.Longitude = newLon;
                cameraChanged = true;
            }

            if (cameraChanged)
            {
                updatedCluster8CameraCount++;
            }
        }

        if (insertedCluster8CameraCount > 0 || updatedCluster8CameraCount > 0)
        {
            await context.SaveChangesAsync();
            Console.WriteLine($"✅ Cụm 8: thêm {insertedCluster8CameraCount} camera, cập nhật {updatedCluster8CameraCount} camera.");
        }

        var existingCluster8Streams = await context.CameraStreams
            .Where(s => cluster8CameraIds.Contains(s.CameraId) && s.IsPrimary)
            .ToDictionaryAsync(s => s.CameraId, s => s);

        var insertedCluster8StreamCount = 0;
        var updatedCluster8StreamCount = 0;
        foreach (var seed in cluster8TrafficCameraSeeds)
        {
            var targetStreamType = seed.StreamUrl.Contains(".m3u8", StringComparison.OrdinalIgnoreCase) ? "HLS" : "Snapshot";

            if (!existingCluster8Streams.TryGetValue(seed.Id, out var stream))
            {
                await context.CameraStreams.AddAsync(new CameraStream
                {
                    CameraId = seed.Id,
                    StreamUrl = seed.StreamUrl,
                    StreamType = targetStreamType,
                    IsPrimary = true,
                    IsActive = true
                });
                insertedCluster8StreamCount++;
                continue;
            }

            var streamChanged = false;
            if (stream.StreamUrl != seed.StreamUrl)
            {
                stream.StreamUrl = seed.StreamUrl;
                streamChanged = true;
            }

            if (stream.StreamType != targetStreamType)
            {
                stream.StreamType = targetStreamType;
                streamChanged = true;
            }

            if (!stream.IsActive)
            {
                stream.IsActive = true;
                streamChanged = true;
            }

            if (streamChanged)
            {
                updatedCluster8StreamCount++;
            }
        }

        if (insertedCluster8StreamCount > 0 || updatedCluster8StreamCount > 0)
        {
            await context.SaveChangesAsync();
            Console.WriteLine($"✅ Cụm 8: thêm {insertedCluster8StreamCount} luồng camera, cập nhật {updatedCluster8StreamCount} luồng camera.");
        }

        var existingCameras = await context.Cameras.ToListAsync();
        var validWardIds = await context.Wards
            .Select(w => w.WardId)
            .ToHashSetAsync();

        var updatedCameraCount = 0;
        var clearedInvalidWardRefCount = 0;
        foreach (var camera in existingCameras)
        {
            string? expectedWardId = null;

            if (cameraWardMap.TryGetValue(camera.Id, out var mappedById))
            {
                expectedWardId = mappedById;
            }
            else
            {
                var normalizedName = (camera.Name ?? string.Empty).Trim().ToLowerInvariant();
                foreach (var rule in cameraNameWardRules)
                {
                    if (normalizedName.Contains(rule.Key))
                    {
                        expectedWardId = rule.Value;
                        break;
                    }
                }
            }

            if (string.IsNullOrEmpty(expectedWardId))
            {
                if (!string.IsNullOrEmpty(camera.WardId) && !validWardIds.Contains(camera.WardId))
                {
                    camera.WardId = null;
                    clearedInvalidWardRefCount++;
                }

                continue;
            }

            if (!validWardIds.Contains(expectedWardId))
            {
                if (!string.IsNullOrEmpty(camera.WardId) && !validWardIds.Contains(camera.WardId))
                {
                    camera.WardId = null;
                    clearedInvalidWardRefCount++;
                }

                continue;
            }

            if (camera.WardId != expectedWardId)
            {
                camera.WardId = expectedWardId;
                updatedCameraCount++;
            }
        }

        if (updatedCameraCount > 0 || clearedInvalidWardRefCount > 0)
        {
            await context.SaveChangesAsync();
            Console.WriteLine($"✅ Camera WardId: cập nhật {updatedCameraCount}, làm sạch tham chiếu lỗi {clearedInvalidWardRefCount}.");
        }

        // 3. Seed WeatherLogs (Nếu chưa có)
        if (context.WeatherLogs.Any())
        {
            Console.WriteLine("✅ Database đã có dữ liệu WeatherLogs, bỏ qua seeding.");
        }
        else
        {
            Console.WriteLine("🌱 Bắt đầu seed dữ liệu test...");

            var testData = new[]
            {
                new WeatherLog
                {
                    CameraId = "CAM_BenThanh",
                    Location = new Point(106.6983, 10.7721) { SRID = 4326 },
                    IsRaining = true,
                    Confidence = 0.87f,
                    Timestamp = DateTime.UtcNow.AddMinutes(-5)
                },
                new WeatherLog
                {
                    CameraId = "CAM_NhaThoDucBa",
                    Location = new Point(106.6990, 10.7797) { SRID = 4326 },
                    IsRaining = false,
                    Confidence = 0.92f,
                    Timestamp = DateTime.UtcNow.AddMinutes(-10)
                },
                new WeatherLog
                {
                    CameraId = "CAM_PhoNguyen",
                    Location = new Point(106.6950, 10.7650) { SRID = 4326 },
                    IsRaining = true,
                    Confidence = 0.78f,
                    Timestamp = DateTime.UtcNow.AddMinutes(-15)
                },
                new WeatherLog
                {
                    CameraId = "CAM_QuanTan",
                    Location = new Point(106.7050, 10.7850) { SRID = 4326 },
                    IsRaining = false,
                    Confidence = 0.95f,
                    Timestamp = DateTime.UtcNow.AddMinutes(-20)
                }
            };

            await context.WeatherLogs.AddRangeAsync(testData);
            await context.SaveChangesAsync();

            Console.WriteLine($"✅ Đã thêm {testData.Length} bản ghi test vào database.");
        }

        // --- 4. SEED USER ADMIN (MỚI) ---
        // Kiểm tra xem đã có admin chưa, nếu chưa thì tạo
        if (!context.Users.Any(u => u.Role == AppConstants.UserRoles.Admin))
        {
            Console.WriteLine("👤 Đang tạo tài khoản Admin mặc định...");
            
            // Mật khẩu mặc định: "admin123"
            // Lưu ý: Phải cài package 'BCrypt.Net-Next' trước đó
            string passwordHash = BCrypt.Net.BCrypt.HashPassword("admin123");

            var adminUser = new User
            {
                Username = "admin",
                Email = "admin@hcmcrain.com",
                PasswordHash = passwordHash,
                Role = AppConstants.UserRoles.Admin, // Quyền cao nhất
                CreatedAt = DateTime.UtcNow
            };

            await context.Users.AddAsync(adminUser);
            await context.SaveChangesAsync();
            
            Console.WriteLine("✅ Đã tạo User: admin / admin123");
        }
    }

    /// <summary>
    /// Migration dữ liệu từ cấu trúc cũ sang mới (Chạy 1 lần)
    /// </summary>
    private static async Task MigrateOldData(AppDbContext context)
    {
        // 1. Tạo Ward mặc định nếu chưa có (chỉ khi bảng wards trống hoàn toàn)
        var defaultWardExists = await context.Wards.AnyAsync(w => w.WardId == "DEFAULT");
        if (!await context.Wards.AnyAsync())
        {
            Console.WriteLine("🏘️ Tạo Ward mặc định...");
            context.Wards.Add(new Ward 
            { 
                WardId = "DEFAULT", 
                WardName = "Chưa xác định", 
                DistrictName = "Chưa xác định",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
            defaultWardExists = true;
        }

        // 2. Gán Ward mặc định cho cameras chưa có WardId — chỉ khi DEFAULT còn tồn tại
        if (defaultWardExists)
        {
            var camerasWithoutWard = await context.Cameras
                .Where(c => c.WardId == null)
                .ToListAsync();

            if (camerasWithoutWard.Any())
            {
                Console.WriteLine($"🏘️ Gán Ward mặc định cho {camerasWithoutWard.Count} cameras...");
                foreach (var cam in camerasWithoutWard)
                {
                    cam.WardId = "DEFAULT";
                }
                await context.SaveChangesAsync();
            }
        }

        // 3. Remap WardId cũ (định dạng _QX/_TB/_TD/_BT) sang định dạng mới (_CXX theo QĐ2913)
        var legacyWardRemap = new Dictionary<string, string>
        {
            ["W_SAIGON_Q1"]       = "W_SAIGON_C01",
            ["W_TANDINH_Q1"]      = "W_TANDINH_C01",
            ["W_NHIEULOC_Q3"]     = "W_NHIEULOC_C01",
            ["W_HOAHUNG_Q10"]     = "W_HOAHUNG_C01",
            ["W_VUONLAI_Q10"]     = "W_VUONLAI_C01",
            ["W_TANSONNHAT_TB"]   = "W_TANSONNHAT_C04",
            ["W_PHULAM_Q6"]       = "W_PHULAM_C03",
            ["W_BINHPHU_Q6"]      = "W_BINHPHU_C03",
            ["W_THANHMYTAY_BT"]   = "W_THANHMYTAY_C06",
            ["W_GIADINH_BT"]      = "W_GIADINH_C06",
            ["W_TRUONGTHO_TD"]    = "W_THUDUC_C06",
            ["W_LINHTRUNG_TD"]    = "W_LINHXUAN_C08",
            ["W_ANPHU_TD"]        = "W_ANKHANH_C08",
        };

        var newWardIds = new HashSet<string>(legacyWardRemap.Values);
        var existingNewWardIds = await context.Wards
            .Where(w => newWardIds.Contains(w.WardId))
            .Select(w => w.WardId)
            .ToListAsync();

        if (existingNewWardIds.Count > 0)
        {
            var camerasToRemap = await context.Cameras
                .Where(c => c.WardId != null && legacyWardRemap.Keys.Contains(c.WardId))
                .ToListAsync();

            var remapped = 0;
            foreach (var cam in camerasToRemap)
            {
                if (legacyWardRemap.TryGetValue(cam.WardId!, out var newId) && existingNewWardIds.Contains(newId))
                {
                    cam.WardId = newId;
                    remapped++;
                }
            }

            if (remapped > 0)
            {
                await context.SaveChangesAsync();
                Console.WriteLine($"✅ Đã remap WardId cũ → mới (QĐ2913) cho {remapped} camera.");
            }
        }
    }
}
