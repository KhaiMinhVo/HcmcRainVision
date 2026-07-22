using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace HcmcRainVision.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddTemporalRainVotingAndTrainingReviews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<float>(
                name: "RawConfidence",
                table: "weather_logs",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<bool>(
                name: "RawIsRaining",
                table: "weather_logs",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "training_image_reviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    WeatherLogId = table.Column<int>(type: "integer", nullable: false),
                    Label = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ReviewedByUserId = table.Column<int>(type: "integer", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_training_image_reviews", x => x.Id);
                    table.ForeignKey(
                        name: "fk_training_image_reviews_users_reviewed_by_user_id",
                        column: x => x.ReviewedByUserId,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "fk_training_image_reviews_weather_logs_weather_log_id",
                        column: x => x.WeatherLogId,
                        principalTable: "weather_logs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_training_image_reviews_reviewed_by_user_id",
                table: "training_image_reviews",
                column: "ReviewedByUserId");

            migrationBuilder.CreateIndex(
                name: "ix_training_image_reviews_weather_log_id",
                table: "training_image_reviews",
                column: "WeatherLogId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "training_image_reviews");

            migrationBuilder.DropColumn(
                name: "RawConfidence",
                table: "weather_logs");

            migrationBuilder.DropColumn(
                name: "RawIsRaining",
                table: "weather_logs");
        }
    }
}
