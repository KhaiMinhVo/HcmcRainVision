FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["HcmcRainVision.Backend.csproj", "./"]
RUN dotnet restore "HcmcRainVision.Backend.csproj"
COPY . .
RUN dotnet build "HcmcRainVision.Backend.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "HcmcRainVision.Backend.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Cài thư viện native cần thiết cho OpenCV/OpenCvSharp trên Linux
RUN apt-get update && apt-get install -y \
	libgl1 \
	libglib2.0-0 \
	libsm6 \
	libxext6 \
	libxrender-dev \
	tzdata \
	&& rm -rf /var/lib/apt/lists/*

ENV TZ="Asia/Ho_Chi_Minh"

COPY --from=publish /app/publish .
RUN mkdir -p wwwroot/images/rain_logs
EXPOSE 8080
# Sử dụng PORT từ môi trường (Render, Railway, etc.) hoặc mặc định 8080.
# Lưu ý: Dockerfile ENV không tự expand ${PORT:-8080} theo cách shell mong muốn,
# nên cần expand tại thời điểm container start.
ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://+:${PORT:-8080} dotnet HcmcRainVision.Backend.dll"]