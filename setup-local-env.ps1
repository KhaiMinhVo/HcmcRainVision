# =============================================================================
# HCMC Rain Vision - Local Development Setup Script
# =============================================================================
# Sử dụng: .\setup-local-env.ps1
# 
# Script này sẽ:
# - Tạo appsettings.Local.json từ template
# - Hướng dẫn setup Gmail App Password
# - Verify database connection
# =============================================================================

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "  HCMC Rain Vision - Local Development Setup" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra file example tồn tại
if (-not (Test-Path "appsettings.Local.json.example")) {
    Write-Host "❌ Không tìm thấy file appsettings.Local.json.example" -ForegroundColor Red
    exit 1
}

# Kiểm tra nếu đã có file Local
if (Test-Path "appsettings.Local.json") {
    Write-Host "⚠️  File appsettings.Local.json đã tồn tại" -ForegroundColor Yellow
    $overwrite = Read-Host "Bạn có muốn ghi đè không? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Hủy bỏ." -ForegroundColor Gray
        exit 0
    }
}

# Copy template
Write-Host "📋 Tạo file appsettings.Local.json từ template..." -ForegroundColor Green
Copy-Item "appsettings.Local.json.example" "appsettings.Local.json"

# Nhập thông tin
Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "  NHẬP THÔNG TIN CẤU HÌNH" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

# Database Password
Write-Host "🗄️  DATABASE CONFIGURATION" -ForegroundColor Yellow
Write-Host "   Nhập password PostgreSQL của bạn (mặc định: postgres)" -ForegroundColor Gray
$dbPassword = Read-Host "   Password"
if ([string]::IsNullOrWhiteSpace($dbPassword)) {
    $dbPassword = "postgres"
}

# Email
Write-Host ""
Write-Host "📧 EMAIL CONFIGURATION" -ForegroundColor Yellow
Write-Host "   Nhập email Gmail để gửi thông báo" -ForegroundColor Gray
$email = Read-Host "   Email"

Write-Host ""
Write-Host "   Gmail App Password (16 ký tự, có dấu cách)" -ForegroundColor Gray
Write-Host "   Nếu chưa có, làm theo hướng dẫn:" -ForegroundColor Gray
Write-Host "   1. Bật 2FA: https://myaccount.google.com/security" -ForegroundColor DarkGray
Write-Host "   2. Tạo App Password: https://myaccount.google.com/apppasswords" -ForegroundColor DarkGray
Write-Host "   3. Chọn 'Mail' và copy password" -ForegroundColor DarkGray
$emailPassword = Read-Host "   App Password"

# Cập nhật file JSON
$json = Get-Content "appsettings.Local.json" -Raw | ConvertFrom-Json

# Update database connection
$json.ConnectionStrings.DefaultConnection = "Host=localhost;Port=5432;Database=hcmc_rain_vision_dev;Username=postgres;Password=$dbPassword"

# Update email settings
$json.EmailSettings.SenderEmail = $email
$json.EmailSettings.Password = $emailPassword

# Save file
$json | ConvertTo-Json -Depth 10 | Set-Content "appsettings.Local.json"

Write-Host ""
Write-Host "✅ Tạo file appsettings.Local.json thành công!" -ForegroundColor Green
Write-Host ""

# Verify database connection
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "  KIỂM TRA KẾT NỐI DATABASE" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

$testConnection = Read-Host "Bạn có muốn test kết nối PostgreSQL không? (y/N)"
if ($testConnection -eq "y" -or $testConnection -eq "Y") {
    Write-Host "🔍 Đang kiểm tra kết nối..." -ForegroundColor Green
    
    try {
        # Test với psql (nếu có)
        $psqlPath = Get-Command psql -ErrorAction SilentlyContinue
        if ($psqlPath) {
            $env:PGPASSWORD = $dbPassword
            $result = psql -h localhost -U postgres -d postgres -c "SELECT version();" 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Kết nối PostgreSQL thành công!" -ForegroundColor Green
            } else {
                Write-Host "❌ Không thể kết nối PostgreSQL" -ForegroundColor Red
                Write-Host "Lỗi: $result" -ForegroundColor Red
            }
            Remove-Item Env:\PGPASSWORD
        } else {
            Write-Host "⚠️  'psql' không được cài đặt, bỏ qua test connection" -ForegroundColor Yellow
            Write-Host "   Bạn có thể test bằng cách chạy app: dotnet run" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ Lỗi khi test connection: $_" -ForegroundColor Red
    }
}

# Hướng dẫn tiếp theo
Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "  BƯỚC TIẾP THEO" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Khởi động PostgreSQL (nếu chưa chạy)" -ForegroundColor White
Write-Host "   pg_ctl start" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Tạo database:" -ForegroundColor White
Write-Host "   createdb hcmc_rain_vision_dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Chạy migrations:" -ForegroundColor White
Write-Host "   dotnet ef database update" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Chạy ứng dụng:" -ForegroundColor White
Write-Host "   dotnet run" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Truy cập API tại: http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "📚 Xem thêm:" -ForegroundColor Yellow
Write-Host "   - CONFIGURATION.md - Hướng dẫn cấu hình chi tiết" -ForegroundColor Gray
Write-Host "   - DEPLOYMENT_GUIDE.md - Hướng dẫn deploy production" -ForegroundColor Gray
Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "✨ Setup hoàn tất! Happy coding! 🚀" -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Cyan
