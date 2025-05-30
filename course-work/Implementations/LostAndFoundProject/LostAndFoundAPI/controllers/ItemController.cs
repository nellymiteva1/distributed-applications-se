using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LostAndFoundAPI.Data;
using LostAndFoundAPI.Models;
using Microsoft.AspNetCore.Authorization;

namespace LostAndFoundAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ItemController : ControllerBase
    {
        private readonly LostAndFoundContext _context;

        public ItemController(LostAndFoundContext context)
        {
            _context = context;
        }

        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Item>>> GetItems()
        {
            return await _context.Items
                .Include(i => i.User)
                .Include(i => i.Category)
                .ToListAsync();
        }

       
        [HttpGet("{id}")]
        public async Task<ActionResult<Item>> GetItem(int id)
        {
            var item = await _context.Items
                .Include(i => i.User)
                .Include(i => i.Category)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (item == null)
                return NotFound();

            return item;
        }

        
        [HttpPost]
        public async Task<ActionResult<Item>> CreateItem(Item item)
        {
            _context.Items.Add(item);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetItem), new { id = item.Id }, item);
        }

        // Update
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateItem(int id, Item item)
        {
            if (id != item.Id)
                return BadRequest();

            _context.Entry(item).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Items.Any(i => i.Id == id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // Delete
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null)
                return NotFound();

            _context.Items.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Item>>> SearchItems(
            string? name,
            string? location,
            string sortBy = "dateFoundOrLost",
            bool isDescending = false,
            int pageNumber = 1,
            int pageSize = 10)
        {
            var query = _context.Items
    .Include(i => i.User)
    .Include(i => i.Category) 
    .AsQueryable();


            // Filter
            if (!string.IsNullOrWhiteSpace(name))
                query = query.Where(i => i.Name != null && i.Name.Contains(name));

            if (!string.IsNullOrWhiteSpace(location))
                query = query.Where(i => i.Location != null && i.Location.Contains(location));

            // Sort
            query = sortBy.ToLower() switch
            {
                "name" => isDescending ? query.OrderByDescending(i => i.Name) : query.OrderBy(i => i.Name),
                "estimatedvalue" => isDescending ? query.OrderByDescending(i => i.EstimatedValue) : query.OrderBy(i => i.EstimatedValue),
                "datefoundorlost" => isDescending ? query.OrderByDescending(i => i.DateFoundOrLost) : query.OrderBy(i => i.DateFoundOrLost),
                _ => query.OrderBy(i => i.DateFoundOrLost)
            };

            // Paging
            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var totalCount = await query.CountAsync(); 

            return Ok(new
            {
                items,
                totalItems = totalCount
            });

        }
    }
}


