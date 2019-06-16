using Microsoft.EntityFrameworkCore.Migrations;

namespace RentTracker.Data.Migrations
{
    public partial class added_default_values_to_reservation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "People",
                table: "Reservations",
                nullable: true,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Infants",
                table: "Reservations",
                nullable: true,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Children",
                table: "Reservations",
                nullable: true,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Adults",
                table: "Reservations",
                nullable: true,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldNullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "People",
                table: "Reservations",
                nullable: true,
                oldClrType: typeof(int),
                oldNullable: true,
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "Infants",
                table: "Reservations",
                nullable: true,
                oldClrType: typeof(int),
                oldNullable: true,
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "Children",
                table: "Reservations",
                nullable: true,
                oldClrType: typeof(int),
                oldNullable: true,
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "Adults",
                table: "Reservations",
                nullable: true,
                oldClrType: typeof(int),
                oldNullable: true,
                oldDefaultValue: 0);
        }
    }
}
