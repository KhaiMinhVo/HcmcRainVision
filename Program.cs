using HcmcRainVision.Backend.Data;
using HcmcRainVision.Backend.BackgroundJobs;
using HcmcRainVision.Backend.Services.Crawling;
using HcmcRainVision.Backend.Services.ImageProcessing;
using HcmcRainVision.Backend.Services.AI;
using HcmcRainVision.Backend.Services.Notification;
using HcmcRainVision.Backend.Services.Chatbot;
using HcmcRainVision.Backend.Hubs;
using HcmcRainVision.Backend;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.ML;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Text;
using HcmcRainVision.Backend.Swagger;

// ===================================================================
// HCMC Rain Vision Backend API
// 
// QUAN TRỌNG - CHÍNH SÁCH SỬ DỤNG DỮ LIỆU:
// - Dữ liệu camera từ: http://giaothong.hochiminhcity.gov.vn
// - Mục đích: Nghiên cứu, học tập, phi lợi nhuận
// - Frontend PHẢI hiển thị: "Dữ liệu camera từ Cổng thông tin giao thông TP.HCM"
// - Xem thêm: POLICY.md
// ===================================================================

var builder = WebApplication.CreateBuilder(args);

// Load local configuration file if exists (for sensitive credentials)
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

// 1. Đăng ký Database (PostgreSQL)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
{
    // Increase command timeout to 60 seconds (default is 30s) to avoid cancellation errors
    options.UseNpgsql(connectionString, npgsqlOptions => 
    {
        npgsqlOptions.UseNetTopologySuite();
        npgsqlOptions.CommandTimeout(60);
    });
});

// 2. Đăng ký HttpClient Factory với Polly Resilience
// QUAN TRỌNG: Camera servers từ giaothong.hochiminhcity.gov.vn có thể chậm (5-15 giây)
// nên cần timeout dài hơn và retry logic thông minh
// NOTE: Polly có 2 timeout layers:
//   - AttemptTimeout: timeout cho mỗi lần thử (timeout on individual request)
//   - TotalRequestTimeout: timeout tổng cho tất cả retries (timeout for all attempts combined)
// Cả hai đều cần được tăng lên để accommodate servers chậm
builder.Services.AddHttpClient("CameraClient", client =>
{
    // TĂNG TIMEOUT CỰC CAO: 60 giây vì camera servers rất chậm
    // Polly sẽ có timeout riêng nhưng client timeout cũng ảnh hưởng
    client.Timeout = TimeSpan.FromSeconds(60);
    client.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    client.DefaultRequestHeaders.Referrer = new Uri("http://giaothong.hochiminhcity.gov.vn/");
})
.AddStandardResilienceHandler(options =>
{
    // Timeout mặc định của StandardResilienceHandler khá thấp cho camera feed thực tế.
    // Cần tăng cả attempt timeout và total timeout để không bị cắt ở mốc 30 giây.
    options.AttemptTimeout.Timeout = TimeSpan.FromSeconds(60);
    options.TotalRequestTimeout.Timeout = TimeSpan.FromSeconds(120);
    options.CircuitBreaker.SamplingDuration = TimeSpan.FromMinutes(2);
});

// 2.1. Đăng ký HttpClient mặc định cho các service khác
builder.Services.AddHttpClient();

// 3. Đăng ký các Service (Dependency Injection)
builder.Services.AddSingleton<ICameraCrawler, CameraCrawler>();
builder.Services.AddSingleton<IImagePreProcessor, ImagePreProcessor>();
builder.Services.AddSingleton<ICloudStorageService, CloudStorageService>();
builder.Services.AddSingleton<IRoutePlanningService, OsrmRoutePlanningService>();
builder.Services.AddScoped<IChatbotService, ChatbotService>();
// 4. Đăng ký Background Worker (Chạy ngầm)
builder.Services.AddHostedService<RainScanningWorker>();

// 5. Đăng ký AI Service với fallback an toàn khi model ML.NET không khả dụng
var modelFilePath = Path.Combine(builder.Environment.ContentRootPath, "MLModels", "RainModel.zip");
var enableMlModel = builder.Configuration.GetValue("AI:EnableModel", true);
var canUseMlModel = enableMlModel && File.Exists(modelFilePath);

if (canUseMlModel)
{
    try
    {
        builder.Services.AddPredictionEnginePool<ModelInput, ModelOutput>()
            .FromFile(modelName: "RainModel", filePath: modelFilePath, watchForChanges: true);
        builder.Services.AddScoped<IRainPredictionService, MlRainPredictionService>();
    }
    catch (Exception ex)
    {
        builder.Logging.AddConsole();
        Console.WriteLine($"⚠️ Không thể khởi tạo ML model, fallback sang mock: {ex.Message}");
        builder.Services.AddScoped<IRainPredictionService, MockRainPredictionService>();
    }
}
else
{
    builder.Services.AddScoped<IRainPredictionService, MockRainPredictionService>();
}

// 6. Đăng ký Email Service
builder.Services.AddTransient<IEmailService, EmailService>();

// 6.1. Đăng ký Firebase Push Notification Service
builder.Services.AddSingleton<IFirebasePushService, FirebasePushService>();

// 7. Đăng ký JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8
                .GetBytes(builder.Configuration.GetSection("JwtSettings:Key").Value!)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

// 8. Đăng ký Controllers với JSON options và Model Validation
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        // Tùy chỉnh response khi ModelState invalid để hiển thị lỗi rõ ràng
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .Select(e => new
                {
                    field = e.Key,
                    errors = e.Value!.Errors.Select(x => x.ErrorMessage).ToArray()
                })
                .ToList();

            return new BadRequestObjectResult(new
            {
                message = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
                errors = errors
            });
        };
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SchemaFilter<RequestExampleSchemaFilter>();

    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Nhập 'Bearer' [space] rồi dán JWT token vào đây. Ví dụ: 'Bearer eyJhbG...'",
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// 8. Đăng ký SignalR
builder.Services.AddSignalR();

// 8.1. Đăng ký Health Checks
builder.Services.AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy("Service is alive"), tags: new[] { "live" })
    .AddNpgSql(connectionString!, tags: new[] { "ready" }); // Check kết nối DB cho readiness

// 9. Cấu hình CORS (Để React gọi được API + SignalR)
// Origin = scheme + host + port (không có path). GitHub Pages: https://khaiminhvo.github.io
var allowedOrigins = new[] { "http://localhost:5173", "https://khaiminhvo.github.io" };
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.WithOrigins(allowedOrigins)
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials()); // Bắt buộc cho SignalR
});

var app = builder.Build();

// Seed test data (tạm thời cho phép chạy ở mọi môi trường để khởi tạo dữ liệu)
// TODO: Sau khi có dữ liệu, nên thêm lại điều kiện IsDevelopment() để bảo mật
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await TestDataSeeder.SeedTestData(dbContext);
        logger.LogInformation("✅ Seed test data thành công.");
    }
    catch (Exception ex)
    {
        // Ghi log lỗi nhưng KHÔNG làm crash app
        logger.LogError(ex, "❌ Lỗi khi Seed Data. App vẫn sẽ tiếp tục chạy.");
    }
}

// Pipeline
// Luôn hiện Swagger để chấm bài (cả Production)
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowReactApp");

// Cho phép truy cập file trong thư mục wwwroot
app.UseStaticFiles();

// Thêm Authentication và Authorization middleware (theo đúng thứ tự)
app.UseAuthentication(); // Xác thực: Bạn là ai?
app.UseAuthorization();  // Phân quyền: Bạn được làm gì?

app.MapControllers();

// Đăng ký SignalR Hub endpoint
app.MapHub<RainHub>("/rainHub");

// Đăng ký Health Check endpoint
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("live")
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

// Giữ endpoint cũ để tương thích ngược
app.MapHealthChecks("/health");

app.Run();