using CoreMVC_WebAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CourseProject.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PlaylistSongController : ControllerBase
    {
        private readonly SoundWaveContext _context;

        public PlaylistSongController(SoundWaveContext context)
        {
            _context = context;
        }
        [HttpGet("{playlistId}")]
        public async Task<ActionResult<IEnumerable<PlaylistSong>>> GetPlaylistSongs(int playlistId)
        {
            var playlistSongs = await _context.PlaylistSongs
                .Where(ps => ps.PlaylistID == playlistId)
                .ToListAsync();

            if (!playlistSongs.Any())
            {
                return NotFound();
            }

            return playlistSongs;
        }

        [HttpPost]
        public async Task<ActionResult<PlaylistSong>> PostPlaylistSong(PlaylistSong playlistSong)
        {
            var playlist = await _context.Playlists.FindAsync(playlistSong.PlaylistID);

            if (playlist == null)
            {
                return NotFound();
            }

            _context.PlaylistSongs.Add(playlistSong);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPlaylistSongs), new { playlistId = playlistSong.PlaylistID }, playlistSong);
        }



        [HttpDelete("{songId}")]
        public async Task<IActionResult> DeletePlaylistSong(int songId)
        {
            var playlistSong = await _context.PlaylistSongs
                .FirstOrDefaultAsync(ps => ps.PlaylistSongID == songId);

            if (playlistSong == null)
            {
                return NotFound();
            }

            _context.PlaylistSongs.Remove(playlistSong);
            await _context.SaveChangesAsync();

            return NoContent();
        }


    }
}