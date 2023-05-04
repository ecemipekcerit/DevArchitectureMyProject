using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations.Ms
{
    /// <inheritdoc />
    public partial class UpdateTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Situation",
                table: "Warehouses",
                newName: "isReady");

            migrationBuilder.RenameColumn(
                name: "Quantity",
                table: "Warehouses",
                newName: "Stock");

            migrationBuilder.RenameColumn(
                name: "Quentity",
                table: "Orders",
                newName: "Quantity");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "isReady",
                table: "Warehouses",
                newName: "Situation");

            migrationBuilder.RenameColumn(
                name: "Stock",
                table: "Warehouses",
                newName: "Quantity");

            migrationBuilder.RenameColumn(
                name: "Quantity",
                table: "Orders",
                newName: "Quentity");
        }
    }
}
