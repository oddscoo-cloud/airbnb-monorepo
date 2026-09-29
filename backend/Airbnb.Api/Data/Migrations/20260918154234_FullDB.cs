using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Airbnb.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class FullDB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "password_hash",
                table: "users",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "avatar_url",
                table: "users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "amenities",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "text", nullable: false),
                    icon = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_amenities", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "listings",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    host_id = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    price_per_night = table.Column<float>(type: "real", nullable: false),
                    max_guests = table.Column<int>(type: "integer", nullable: false),
                    latitude = table.Column<float>(type: "real", nullable: false),
                    longtitude = table.Column<float>(type: "real", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_listings", x => x.id);
                    table.ForeignKey(
                        name: "FK_listings_users_host_id",
                        column: x => x.host_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AmenityListing",
                columns: table => new
                {
                    AmenitiesId = table.Column<int>(type: "integer", nullable: false),
                    ListingsId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AmenityListing", x => new { x.AmenitiesId, x.ListingsId });
                    table.ForeignKey(
                        name: "FK_AmenityListing_amenities_AmenitiesId",
                        column: x => x.AmenitiesId,
                        principalTable: "amenities",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AmenityListing_listings_ListingsId",
                        column: x => x.ListingsId,
                        principalTable: "listings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "bookings",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    guest_id = table.Column<int>(type: "integer", nullable: false),
                    listing_id = table.Column<int>(type: "integer", nullable: false),
                    check_in_date = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    check_out_date = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    total_price = table.Column<float>(type: "real", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bookings", x => x.id);
                    table.ForeignKey(
                        name: "FK_bookings_listings_listing_id",
                        column: x => x.listing_id,
                        principalTable: "listings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_bookings_users_guest_id",
                        column: x => x.guest_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "listing_images",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    listing_id = table.Column<int>(type: "integer", nullable: false),
                    image_url = table.Column<string>(type: "text", nullable: false),
                    is_cover = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_listing_images", x => x.id);
                    table.ForeignKey(
                        name: "FK_listing_images_listings_listing_id",
                        column: x => x.listing_id,
                        principalTable: "listings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "reviews",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    listing_id = table.Column<int>(type: "integer", nullable: false),
                    author_id = table.Column<int>(type: "integer", nullable: false),
                    rating = table.Column<float>(type: "real", nullable: false),
                    comment = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reviews", x => x.id);
                    table.ForeignKey(
                        name: "FK_reviews_listings_listing_id",
                        column: x => x.listing_id,
                        principalTable: "listings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_reviews_users_author_id",
                        column: x => x.author_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AmenityListing_ListingsId",
                table: "AmenityListing",
                column: "ListingsId");

            migrationBuilder.CreateIndex(
                name: "IX_bookings_guest_id",
                table: "bookings",
                column: "guest_id");

            migrationBuilder.CreateIndex(
                name: "IX_bookings_listing_id",
                table: "bookings",
                column: "listing_id");

            migrationBuilder.CreateIndex(
                name: "IX_listing_images_listing_id",
                table: "listing_images",
                column: "listing_id");

            migrationBuilder.CreateIndex(
                name: "IX_listings_host_id",
                table: "listings",
                column: "host_id");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_author_id",
                table: "reviews",
                column: "author_id");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_listing_id",
                table: "reviews",
                column: "listing_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AmenityListing");

            migrationBuilder.DropTable(
                name: "bookings");

            migrationBuilder.DropTable(
                name: "listing_images");

            migrationBuilder.DropTable(
                name: "reviews");

            migrationBuilder.DropTable(
                name: "amenities");

            migrationBuilder.DropTable(
                name: "listings");

            migrationBuilder.DropColumn(
                name: "avatar_url",
                table: "users");
        }
    }
}
