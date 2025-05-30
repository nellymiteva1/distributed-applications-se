using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LostAndFoundAPI.Data;
using LostAndFoundAPI.Models;
using Microsoft.AspNetCore.Authorization;

namespace LostAndFoundAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly LostAndFoundContext _context;

        public UserController(LostAndFoundContext context)
        {
            _context = context;
        }

        
        [HttpGet]
        public async Task<ActionResult> GetUsers(
            [FromQuery] string? firstName,
            [FromQuery] string? lastName,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string sortBy = "FirstName",
            [FromQuery] bool isDescending = false)
        {
            var query = _context.Users.AsQueryable();

           
            if (!string.IsNullOrEmpty(firstName))
                query = query.Where(u => u.FirstName!.Contains(firstName));
            if (!string.IsNullOrEmpty(lastName))
                query = query.Where(u => u.LastName!.Contains(lastName));

            
            query = sortBy.ToLower() switch
            {
                "firstname" => isDescending ? query.OrderByDescending(u => u.FirstName) : query.OrderBy(u => u.FirstName),
                "lastname" => isDescending ? query.OrderByDescending(u => u.LastName) : query.OrderBy(u => u.LastName),
                "dateregistered" => isDescending ? query.OrderByDescending(u => u.DateRegistered) : query.OrderBy(u => u.DateRegistered),
                _ => query.OrderBy(u => u.FirstName)
            };

            
            var totalItems = await query.CountAsync();
            var users = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize,
                Users = users
            });
        }

        // GET по ID
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();
            return user;
        }

        // POST
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(User user)
        {
            user.DateRegistered = DateTime.UtcNow;
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }

        // PUT
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, User user)
        {
            if (id != user.Id)
                return BadRequest();

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Users.Any(u => u.Id == id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
