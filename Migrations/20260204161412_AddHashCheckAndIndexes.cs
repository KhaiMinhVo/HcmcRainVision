using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HcmcRainVision.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddHashCheckAndIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LastImageHash",
                table: "cameras",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_weather_logs_camera_timestamp",
                table: "weather_logs",
                columns: new[] { "CameraId", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "ix_weather_logs_timestamp",
                table: "weather_logs",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "ix_ingestion_attempts_attempt_at",
                table: "ingestion_attempts",
                column: "attempt_at");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_weather_logs_camera_timestamp",
                table: "weather_logs");

            migrationBuilder.DropIndex(
                name: "ix_weather_logs_timestamp",
                table: "weather_logs");

            migrationBuilder.DropIndex(
                name: "ix_ingestion_attempts_attempt_at",
                table: "ingestion_attempts");

            migrationBuilder.DropColumn(
                name: "LastImageHash",
                table: "cameras");
        }
    }
}
