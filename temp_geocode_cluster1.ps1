$items = @(
    @{ Key = 'Nguyen Huu Canh - Ton Duc Thang'; Label = 'Nguyễn Hữu Cảnh - Tôn Đức Thắng' },
    @{ Key = 'Nam Ky Khoi Nghia - Ham Nghi'; Label = 'Nam Kỳ Khởi Nghĩa - Hàm Nghi' },
    @{ Key = 'Dien Bien Phu - Nguyen Binh Khiem'; Label = 'Điện Biên Phủ - Nguyễn Bỉnh Khiêm' },
    @{ Key = 'Tran Quang Khai - Tran Nhat Duat'; Label = 'Trần Quang Khải - Trần Nhật Duật' },
    @{ Key = 'Dinh Tien Hoang - Vo Thi Sau'; Label = 'Đinh Tiên Hoàng - Võ Thị Sáu' },
    @{ Key = 'Nguyen Van Thu - Tran Doan Khanh'; Label = 'Nguyễn Văn Thủ - Trần Doãn Khanh' },
    @{ Key = 'Cach Mang Thang 8 - Bui Thi Xuan'; Label = 'CMT8 - Bùi Thị Xuân' },
    @{ Key = 'Vo Van Kiet - Cau Ong Lanh'; Label = 'Võ Văn Kiệt - Cầu Ông Lãnh' },
    @{ Key = 'Nguyen Trai - Cong Quynh'; Label = 'Nguyễn Trãi - Cống Quỳnh' },
    @{ Key = 'Tran Hung Dao - Nguyen Cu Trinh'; Label = 'Trần Hưng Đạo - Nguyễn Cư Trinh' },
    @{ Key = 'Nguyen Dinh Chieu - Cao Thang'; Label = 'Nguyễn Đình Chiểu - Cao Thắng' },
    @{ Key = 'Cao Thang - Vo Van Tan'; Label = 'Cao Thắng - Võ Văn Tần' },
    @{ Key = 'Vo Thi Sau - Nguyen Huu Cau'; Label = 'Võ Thị Sáu - Nguyễn Hữu Cầu' },
    @{ Key = 'Vo Thi Sau - Ba Huyen Thanh Quan'; Label = 'Võ Thị Sáu - Bà Huyện Thanh Quan' },
    @{ Key = 'Dien Bien Phu - Truong Dinh'; Label = 'Điện Biên Phủ - Trương Định' },
    @{ Key = 'Tran Quang Dieu - Truong Sa'; Label = 'Trần Quang Diệu - Trường Sa' },
    @{ Key = 'Le Van Sy - Huynh Van Banh'; Label = 'Lê Văn Sỹ - Huỳnh Văn Bánh' },
    @{ Key = 'Ba Thang Hai - Ly Thuong Kiet'; Label = '3/2 - Lý Thường Kiệt' },
    @{ Key = 'Ly Thuong Kiet - To Hien Thanh'; Label = 'Lý Thường Kiệt - Tô Hiến Thành' },
    @{ Key = 'Ba Thang Hai - Thanh Thai'; Label = '3/2 - Thành Thái' },
    @{ Key = 'Ly Thai To - Ho Thi Ky'; Label = 'Lý Thái Tổ - Hồ Thị Kỷ' },
    @{ Key = 'Ly Thai To - Su Van Hanh'; Label = 'Lý Thái Tổ - Sư Vạn Hạnh' },
    @{ Key = 'Hung Vuong - Le Hong Phong'; Label = 'Hùng Vương - Lê Hồng Phong' },
    @{ Key = 'Ba Thang Hai - Cau Vuot Nguyen Tri Phuong'; Label = '3/2 - Cầu vượt Nguyễn Tri Phương' },
    @{ Key = 'Cach Mang Thang 8 - Hoa Hung'; Label = 'CMT8 - Hòa Hưng' },
    @{ Key = 'Ba Thang Hai - Le Hong Phong'; Label = '3/2 - Lê Hồng Phong' },
    @{ Key = 'Nguyen Thi Minh Khai - Nguyen Thien Thuat'; Label = 'Nguyễn Thị Minh Khai - Nguyễn Thiện Thuật' },
    @{ Key = 'Nam Ky Khoi Nghia - Nguyen Thi Minh Khai'; Label = 'Nam Kỳ Khởi Nghĩa - Nguyễn Thị Minh Khai' }
)

$results = foreach ($it in $items) {
    Start-Sleep -Milliseconds 1200
    $q = [uri]::EscapeDataString("$($it.Key), Ho Chi Minh City, Vietnam")
    $url = "https://nominatim.openstreetmap.org/search?q=$q&format=jsonv2&limit=1"

    try {
        $resp = Invoke-RestMethod -Uri $url -Headers @{ "User-Agent" = "HcmcRainVisionSeeder/1.0 (contact: local-dev)" }
        if ($resp -and $resp.Count -gt 0) {
            [pscustomobject]@{
                Name = $it.Label
                Lat = [math]::Round([double]$resp[0].lat, 7)
                Lon = [math]::Round([double]$resp[0].lon, 7)
                DisplayName = $resp[0].display_name
            }
        }
        else {
            [pscustomobject]@{
                Name = $it.Label
                Lat = $null
                Lon = $null
                DisplayName = 'NOT_FOUND'
            }
        }
    }
    catch {
        [pscustomobject]@{
            Name = $it.Label
            Lat = $null
            Lon = $null
            DisplayName = "ERROR: $($_.Exception.Message)"
        }
    }
}

$results | ConvertTo-Json -Depth 4
