using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace CourseProject
{
    public class PlaylistSong
    {
        public int PlaylistSongID { get; set; }
        public int PlaylistID { get; set; }
        public string title { get; set; }
        public string artist { get; set; }
        public string Duration { get; set; }
        public string SongUrl { get; set; }
        public string ArtistUrl { get; set; }
        public string url { get; set; }
        public string image { get; set; }
        public bool IsLyric { get; set; }
        public bool IsVideo { get; set; }
    }

}