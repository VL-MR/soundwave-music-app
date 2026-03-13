using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourseProject.Migrations
{
    /// <inheritdoc />
    public partial class SoundWave : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Artists",
                columns: table => new
                {
                    ArtistID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    realName = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    type = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    url = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    image = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    IsVisible = table.Column<bool>(type: "BIT", nullable: false),
                    IsEdit = table.Column<bool>(type: "BIT", nullable: false),
                    IsAdd = table.Column<bool>(type: "BIT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Artists", x => x.ArtistID);
                });

            migrationBuilder.CreateTable(
                name: "Playlists",
                columns: table => new
                {
                    PlaylistID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlaylistName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PlaylistImage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Playlists", x => x.PlaylistID);
                });

            migrationBuilder.CreateTable(
                name: "PlaylistSongs",
                columns: table => new
                {
                    PlaylistSongID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlaylistID = table.Column<int>(type: "INT", nullable: false),
                    title = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    artist = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    Duration = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    SongUrl = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    ArtistUrl = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    url = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    image = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    IsLyric = table.Column<bool>(type: "BIT", nullable: false),
                    IsVideo = table.Column<bool>(type: "BIT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlaylistSongs", x => x.PlaylistSongID);
                });

            migrationBuilder.CreateTable(
                name: "Songs",
                columns: table => new
                {
                    SongID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    title = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    artist = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    Duration = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    SongUrl = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    ArtistUrl = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    url = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    image = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    Lyric = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    Video = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    ArtistID = table.Column<int>(type: "int", nullable: false),
                    IsLyric = table.Column<bool>(type: "BIT", nullable: false),
                    IsVideo = table.Column<bool>(type: "BIT", nullable: false),
                    IsVisible = table.Column<bool>(type: "BIT", nullable: false),
                    IsEdit = table.Column<bool>(type: "BIT", nullable: false),
                    IsAdd = table.Column<bool>(type: "BIT", nullable: false),
                    IsNew = table.Column<bool>(type: "BIT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Songs", x => x.SongID);
                });

            migrationBuilder.CreateTable(
                name: "UserFavoriteArtists",
                columns: table => new
                {
                    FavoriteArtistID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FavoriteArtistName = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    FavoriteArtistType = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    FavoriteArtistUrl = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    FavoriteArtistImage = table.Column<string>(type: "VARCHAR(MAX)", nullable: false),
                    UserID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserFavoriteArtists", x => x.FavoriteArtistID);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Password = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("UPKCL_useridind", x => x.UserID);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Artists");

            migrationBuilder.DropTable(
                name: "Playlists");

            migrationBuilder.DropTable(
                name: "PlaylistSongs");

            migrationBuilder.DropTable(
                name: "Songs");

            migrationBuilder.DropTable(
                name: "UserFavoriteArtists");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
