using CoreMVC_WebAPI.Data;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace CourseProject.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PlaylistController : ControllerBase
    {
        private readonly SoundWaveContext _context;

        public PlaylistController(SoundWaveContext context)
        {
            _context = context;
        }

        // POST: api/Playlist
        [HttpPost]
        public ActionResult<Playlist> Post(Playlist playlist)
        {
            _context.Playlists.Add(playlist);
            _context.SaveChanges();

            return CreatedAtAction("GetPlaylist", new { id = playlist.PlaylistID }, playlist);
        }

        // GET: api/Playlist
        [HttpGet]
        public ActionResult<IEnumerable<Playlist>> GetPlaylists(int userID)
        {
            return _context.Playlists.Where(p => p.UserID == userID).ToList();
        }

        // PUT: api/Playlist/5
        [HttpPut("{id}")]
        public IActionResult Put(int id, Playlist playlist)
        {
            if (id != playlist.PlaylistID)
            {
                return BadRequest();
            }

            _context.Entry(playlist).State = EntityState.Modified;

            try
            {
                _context.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PlaylistExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Playlist/5
        [HttpDelete("{id}")]
        public ActionResult<Playlist> DeletePlaylist(int id)
        {
            var playlist = _context.Playlists.Find(id);
            if (playlist == null)
            {
                return NotFound();
            }

            _context.Playlists.Remove(playlist);
            _context.SaveChanges();

            return playlist;
        }

        private bool PlaylistExists(int id)
        {
            return _context.Playlists.Any(e => e.PlaylistID == id);
        }
    }
}