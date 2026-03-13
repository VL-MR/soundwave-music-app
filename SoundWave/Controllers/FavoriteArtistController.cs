using CoreMVC_WebAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CourseProject.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class FavoriteArtistController : ControllerBase
    {
        private readonly SoundWaveContext _context;

        public FavoriteArtistController(SoundWaveContext context)
        {
            _context = context;
        }
            
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserFavoriteArtist>>> GetUserFavoriteArtists(int userId)
        {
            return await _context.UserFavoriteArtists.Where(a => a.UserID == userId).ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<UserFavoriteArtist>> PostUserFavoriteArtist(int userId, UserFavoriteArtist userFavoriteArtist)
        {
            userFavoriteArtist.UserID = userId;
            _context.UserFavoriteArtists.Add(userFavoriteArtist);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUserFavoriteArtist", new { id = userFavoriteArtist.FavoriteArtistID }, userFavoriteArtist);
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteUserFavoriteArtist(int userId, int id)
        {
            var userFavoriteArtist = await _context.UserFavoriteArtists.FirstOrDefaultAsync(a => a.FavoriteArtistID == id && a.UserID == userId);
            if (userFavoriteArtist == null)
            {
                return NotFound();
            }

            _context.UserFavoriteArtists.Remove(userFavoriteArtist);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}