namespace CourseProject
{
    public class Song
    {
        public int SongID { get; set; }
        public string title { get; set; }
        public string artist { get; set; }
        public string Duration { get; set; }
        public string SongUrl { get; set; }
        public string ArtistUrl { get; set; }
        public string url { get; set; }
        public string image { get; set; }
        public string Lyric { get; set; }
        public string Video { get; set; }
        public int ArtistID { get; set; }
        public bool IsLyric { get; set; }
        public bool IsVideo { get; set; }
        public bool IsVisible { get; set; }
        public bool IsEdit { get; set; }
        public bool IsAdd { get; set; }
        public bool IsNew { get; set; }
    }

}