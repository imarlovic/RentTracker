using Microsoft.EntityFrameworkCore.Migrations;

namespace RentTracker.Data.Migrations
{
    public partial class adjusted_reservation_expense_entities : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "Price",
                table: "Reservations",
                type: "decimal(9, 2)",
                nullable: true,
                defaultValue: 0.0m,
                oldClrType: typeof(decimal),
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Commission",
                table: "Reservations",
                type: "decimal(9, 2)",
                nullable: true,
                defaultValue: 0.0m,
                oldClrType: typeof(decimal),
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Infants",
                table: "Reservations",
                nullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Amount",
                table: "Expenses",
                type: "decimal(9, 2)",
                nullable: false,
                defaultValue: 0.0m,
                oldClrType: typeof(decimal));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Infants",
                table: "Reservations");

            migrationBuilder.AlterColumn<decimal>(
                name: "Price",
                table: "Reservations",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(9, 2)",
                oldNullable: true,
                oldDefaultValue: 0.0m);

            migrationBuilder.AlterColumn<decimal>(
                name: "Commission",
                table: "Reservations",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(9, 2)",
                oldNullable: true,
                oldDefaultValue: 0.0m);

            migrationBuilder.AlterColumn<decimal>(
                name: "Amount",
                table: "Expenses",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(9, 2)",
                oldDefaultValue: 0.0m);
        }
    }
}
