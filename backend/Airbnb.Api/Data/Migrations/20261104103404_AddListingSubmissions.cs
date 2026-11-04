using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Airbnb.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddListingSubmissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "rejection_reason",
                table: "listings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "review_status",
                table: "listings",
                type: "text",
                nullable: false,
                defaultValue: "Approved");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "reviewed_at",
                table: "listings",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "submitted_at",
                table: "listings",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "rejection_reason",
                table: "listings");

            migrationBuilder.DropColumn(
                name: "review_status",
                table: "listings");

            migrationBuilder.DropColumn(
                name: "reviewed_at",
                table: "listings");

            migrationBuilder.DropColumn(
                name: "submitted_at",
                table: "listings");
        }
    }
}
