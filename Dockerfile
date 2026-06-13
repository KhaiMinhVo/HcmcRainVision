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
# Cấu hình Port mặc định chuẩn .NET 8/9 (Bỏ qua shell -c dễ gây lỗi crash Kestrel trên Google Cloud)
ENV ASPNETCORE_HTTP_PORTS=8080
ENTRYPOINT ["dotnet", "HcmcRainVision.Backend.dll"]