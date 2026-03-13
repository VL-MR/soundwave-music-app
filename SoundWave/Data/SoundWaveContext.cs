using CourseProject;
using Microsoft.EntityFrameworkCore;

namespace CoreMVC_WebAPI.Data;

public partial class SoundWaveContext : DbContext
{
    public SoundWaveContext()
    {
    }

    public SoundWaveContext(DbContextOptions<SoundWaveContext> options)
        : base(options)
    {
    }

    public virtual DbSet<User> Users { get; set; }
    public virtual DbSet<Playlist> Playlists { get; set; }
    public virtual DbSet<PlaylistSong> PlaylistSongs { get; set; }
    public virtual DbSet<UserFavoriteArtist> UserFavoriteArtists { get; set; }
    public virtual DbSet<Artist> Artists { get; set; }
    public virtual DbSet<Song> Songs { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        string cn = @"Server=.\SQLEXPRESS;Database=SoundWave;Trusted_Connection=True;TrustServerCertificate=True";
        optionsBuilder.UseSqlServer(cn);

        base.OnConfiguring(optionsBuilder);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserID).HasName("UPKCL_useridind");
            entity.Property(e => e.Name).HasMaxLength(50);
            entity.Property(e => e.Email).HasMaxLength(50);
            entity.Property(e => e.Password).HasMaxLength(50);
        });

        modelBuilder.Entity<Playlist>(entity =>
        {
            entity.HasKey(e => e.PlaylistID);
            entity.Property(e => e.PlaylistName).HasMaxLength(50);
        });

        modelBuilder.Entity<PlaylistSong>(entity =>
        {
            entity.HasKey(e => e.PlaylistSongID);
            entity.Property(e => e.PlaylistID).HasColumnType("INT");
            entity.Property(e => e.title).HasColumnType("VARCHAR(MAX)");
            entity.Property(e => e.artist).HasColumnType("VARCHAR(MAX)");
            entity.Property(e => e.Duration).HasColumnType("VARCHAR(MAX)");
            entity.Property(e => e.SongUrl).HasColumnType("VARCHAR(MAX)");
            entity.Property(e => e.ArtistUrl).HasColumnType("VARCHAR(MAX)");
            entity.Property(e => e.url).HasColumnType("VARCHAR(MAX)");
            entity.Property(e => e.image).HasColumnType("VARCHAR(MAX)");
            entity.Property(e => e.IsLyric).HasColumnType("BIT");
            entity.Property(e => e.IsVideo).HasColumnType("BIT");
        });

        modelBuilder.Entity<UserFavoriteArtist>(entity =>
        {
            entity.HasKey(e => e.FavoriteArtistID);
            entity.Property(e => e.FavoriteArtistName).HasColumnType("VARCHAR(MAX)");
            entity.Property(e => e.FavoriteArtistType).HasColumnType("VARCHAR(MAX)");
            entity.Property(e => e.FavoriteArtistUrl).HasColumnType("VARCHAR(MAX)");
            entity.Property(e => e.FavoriteArtistImage).HasColumnType("VARCHAR(MAX)");
        });

        modelBuilder.Entity<Artist>(entity =>
        {
            entity.HasKey(e => e.ArtistID);
            entity.Property(e => e.name).HasColumnType("VARCHAR(MAX)");
            entity.Property(e => e.realName).HasColumnType("VARCHAR(MAX)");
            entity.Property(e => e.type).HasColumnType("VARCHAR(MAX)");
            entity.Property(e => e.url).HasColumnType("VARCHAR(MAX)");
            entity.Property(e => e.image).HasColumnType("VARCHAR(MAX)");
            entity.Property(e => e.IsVisible).HasColumnType("BIT");
            entity.Property(e => e.IsEdit).HasColumnType("BIT");
            entity.Property(e => e.IsAdd).HasColumnType("BIT");
        });

        modelBuilder.Entity<Song>(entity =>
        {
            entity.HasKey(e => e.SongID);
            entity.Property(e => e.title).HasColumnType("VARCHAR(MAX)");
            entity.Property(e => e.artist).HasColumnType("VARCHAR(MAX)");
            entity.Property(e => e.Duration).HasColumnType("VARCHAR(MAX)");
            entity.Property(e => e.SongUrl).HasColumnType("VARCHAR(MAX)");
            entity.Property(e => e.ArtistUrl).HasColumnType("VARCHAR(MAX)");
            entity.Property(e => e.url).HasColumnType("VARCHAR(MAX)");
            entity.Property(e => e.image).HasColumnType("VARCHAR(MAX)");
            entity.Property(e => e.Lyric).HasColumnType("VARCHAR(MAX)");
            entity.Property(e => e.Video).HasColumnType("VARCHAR(MAX)");
            entity.Property(e => e.IsLyric).HasColumnType("BIT");
            entity.Property(e => e.IsVideo).HasColumnType("BIT");
            entity.Property(e => e.IsVisible).HasColumnType("BIT");
            entity.Property(e => e.IsEdit).HasColumnType("BIT");
            entity.Property(e => e.IsAdd).HasColumnType("BIT");
            entity.Property(e => e.IsNew).HasColumnType("BIT");
        });

        OnModelCreatingPartial(modelBuilder);
    }


    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
