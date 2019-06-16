using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RentTracker.Data.Migrations
{
    public partial class added_document : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Documents",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    Title = table.Column<string>(nullable: false),
                    Blob = table.Column<byte[]>(nullable: false),
                    MimeType = table.Column<string>(nullable: false),
                    FileName = table.Column<string>(nullable: false),
                    UploadTime = table.Column<DateTime>(nullable: false),
                    FileExtension = table.Column<string>(nullable: false),
                    ApartmentId = table.Column<Guid>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Documents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Documents_Apartments_ApartmentId",
                        column: x => x.ApartmentId,
                        principalTable: "Apartments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Documents_ApartmentId",
                table: "Documents",
                column: "ApartmentId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Documents");
        }
    }
}
