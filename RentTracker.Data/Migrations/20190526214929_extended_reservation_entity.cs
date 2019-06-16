using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RentTracker.Data.Migrations
{
    public partial class extended_reservation_entity : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_Apartments_ApartmentId",
                table: "Reservations");

            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_Document_DocumentId",
                table: "Reservations");

            migrationBuilder.DropTable(
                name: "Document");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_DocumentId",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "DocumentId",
                table: "Reservations");

            migrationBuilder.AlterColumn<int>(
                name: "Source",
                table: "Reservations",
                nullable: false,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "ApartmentId",
                table: "Reservations",
                nullable: false,
                oldClrType: typeof(Guid),
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalId",
                table: "Reservations",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_Apartments_ApartmentId",
                table: "Reservations",
                column: "ApartmentId",
                principalTable: "Apartments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_Apartments_ApartmentId",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "ExternalId",
                table: "Reservations");

            migrationBuilder.AlterColumn<string>(
                name: "Source",
                table: "Reservations",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AlterColumn<Guid>(
                name: "ApartmentId",
                table: "Reservations",
                nullable: true,
                oldClrType: typeof(Guid));

            migrationBuilder.AddColumn<Guid>(
                name: "DocumentId",
                table: "Reservations",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Document",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    ApartmentId = table.Column<Guid>(nullable: true),
                    Blob = table.Column<byte[]>(nullable: true),
                    FileExtension = table.Column<string>(nullable: true),
                    FileName = table.Column<string>(nullable: true),
                    Title = table.Column<string>(nullable: true),
                    UploadTime = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Document", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Document_Apartments_ApartmentId",
                        column: x => x.ApartmentId,
                        principalTable: "Apartments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_DocumentId",
                table: "Reservations",
                column: "DocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_Document_ApartmentId",
                table: "Document",
                column: "ApartmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_Apartments_ApartmentId",
                table: "Reservations",
                column: "ApartmentId",
                principalTable: "Apartments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_Document_DocumentId",
                table: "Reservations",
                column: "DocumentId",
                principalTable: "Document",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
