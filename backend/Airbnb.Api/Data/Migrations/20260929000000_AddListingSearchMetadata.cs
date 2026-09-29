using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Airbnb.Api.Data.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260929000000_AddListingSearchMetadata")]
public partial class AddListingSearchMetadata : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "category",
            table: "listings",
            type: "text",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "location",
            table: "listings",
            type: "text",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "region",
            table: "listings",
            type: "text",
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "category", table: "listings");
        migrationBuilder.DropColumn(name: "location", table: "listings");
        migrationBuilder.DropColumn(name: "region", table: "listings");
    }
}