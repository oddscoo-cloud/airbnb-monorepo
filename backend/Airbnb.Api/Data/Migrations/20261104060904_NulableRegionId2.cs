using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Airbnb.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class NulableRegionId2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_listings_region_region_id",
                table: "listings");

            migrationBuilder.AlterColumn<int>(
                name: "region_id",
                table: "listings",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_listings_region_region_id",
                table: "listings",
                column: "region_id",
                principalTable: "region",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_listings_region_region_id",
                table: "listings");

            migrationBuilder.AlterColumn<int>(
                name: "region_id",
                table: "listings",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_listings_region_region_id",
                table: "listings",
                column: "region_id",
                principalTable: "region",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
