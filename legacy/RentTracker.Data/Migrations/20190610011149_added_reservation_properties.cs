using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RentTracker.Data.Migrations
{
    public partial class added_reservation_properties : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "Price",
                table: "Reservations",
                nullable: true,
                oldClrType: typeof(decimal));

            migrationBuilder.AddColumn<int>(
                name: "Adults",
                table: "Reservations",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "BookingDate",
                table: "Reservations",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Children",
                table: "Reservations",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Commission",
                table: "Reservations",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "People",
                table: "Reservations",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "State",
                table: "Reservations",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Adults",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "BookingDate",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "Children",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "Commission",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "People",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "State",
                table: "Reservations");

            migrationBuilder.AlterColumn<decimal>(
                name: "Price",
                table: "Reservations",
                nullable: false,
                oldClrType: typeof(decimal),
                oldNullable: true);
        }
    }
}
