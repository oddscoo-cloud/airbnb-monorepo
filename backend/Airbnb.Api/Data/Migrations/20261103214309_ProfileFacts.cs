using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Airbnb.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class ProfileFacts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "region",
                table: "listings");

            migrationBuilder.AddColumn<int>(
                name: "region_id",
                table: "listings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "profile_facts",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    education = table.Column<string>(type: "text", nullable: true),
                    profession = table.Column<string>(type: "text", nullable: true),
                    address = table.Column<string>(type: "text", nullable: true),
                    languages = table.Column<string>(type: "text", nullable: true),
                    birthday_decade = table.Column<string>(type: "text", nullable: true),
                    song = table.Column<string>(type: "text", nullable: true),
                    excitement = table.Column<string>(type: "text", nullable: true),
                    fact = table.Column<string>(type: "text", nullable: true),
                    useless_skills = table.Column<string>(type: "text", nullable: true),
                    biography_title = table.Column<string>(type: "text", nullable: true),
                    time_absorber = table.Column<string>(type: "text", nullable: true),
                    pets = table.Column<string>(type: "text", nullable: true),
                    about_me = table.Column<string>(type: "text", nullable: true),
                    favorite = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_profile_facts", x => x.id);
                    table.ForeignKey(
                        name: "FK_profile_facts_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "region",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "text", nullable: false),
                    image_url = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_region", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_listings_region_id",
                table: "listings",
                column: "region_id");

            migrationBuilder.CreateIndex(
                name: "IX_profile_facts_user_id",
                table: "profile_facts",
                column: "user_id",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_listings_region_region_id",
                table: "listings",
                column: "region_id",
                principalTable: "region",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_listings_region_region_id",
                table: "listings");

            migrationBuilder.DropTable(
                name: "profile_facts");

            migrationBuilder.DropTable(
                name: "region");

            migrationBuilder.DropIndex(
                name: "IX_listings_region_id",
                table: "listings");

            migrationBuilder.DropColumn(
                name: "region_id",
                table: "listings");

            migrationBuilder.AddColumn<string>(
                name: "region",
                table: "listings",
                type: "text",
                nullable: true);
        }
    }
}
