using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RentTracker.Data.Migrations
{
    public partial class added_integration_configuration : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "HoldingName",
                table: "Reservations",
                nullable: false,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "IntegrationConfigurations",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    Provider = table.Column<int>(nullable: false),
                    Status = table.Column<int>(nullable: false),
                    StateJson = table.Column<string>(nullable: true),
                    PropertyId = table.Column<string>(nullable: true),
                    Password = table.Column<string>(nullable: true),
                    ApartmentId = table.Column<Guid>(nullable: false),
                    LastUpdated = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IntegrationConfigurations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IntegrationConfigurations_Apartments_ApartmentId",
                        column: x => x.ApartmentId,
                        principalTable: "Apartments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IntegrationConfigurations_ApartmentId",
                table: "IntegrationConfigurations",
                column: "ApartmentId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IntegrationConfigurations");

            migrationBuilder.AlterColumn<string>(
                name: "HoldingName",
                table: "Reservations",
                nullable: true,
                oldClrType: typeof(string));
        }
    }
}
