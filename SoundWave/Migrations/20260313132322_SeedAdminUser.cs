using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourseProject.Migrations
{
    /// <inheritdoc />
    public partial class SeedAdminUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
    IF NOT EXISTS (SELECT 1 FROM Users WHERE Email='admin@admin.com')
    BEGIN
        INSERT INTO Users (Name, Email, Password)
        VALUES ('admin','admin@admin.com','admin')
    END
    
    DECLARE @adminId INT = (SELECT TOP 1 UserID FROM Users WHERE Email='admin@admin.com')
    
    IF NOT EXISTS (SELECT 1 FROM Playlists WHERE UserID=@adminId AND PlaylistName='Favorites')
    BEGIN
        INSERT INTO Playlists (PlaylistName, PlaylistImage, UserID)
        VALUES ('Favorites','default.png',@adminId)
    END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
            table: "Users",
            keyColumn: "UserID",
            keyValue: 1);
        }
    }
}
