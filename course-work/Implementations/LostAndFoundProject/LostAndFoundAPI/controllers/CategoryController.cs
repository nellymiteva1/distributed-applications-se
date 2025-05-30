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
    public class CategoryController : ControllerBase
    {
        private readonly LostAndFoundContext _context;

        public CategoryController(LostAndFoundContext context)
        {
            _context = context;
        }

        // GET: api/Category/search
        [HttpGet("search")]
        public async Task<ActionResult> SearchCategories(
            string? name,
            string? description,
            string sortBy = "name",
            bool isDescending = false,
            int pageNumber = 1,
            int pageSize = 10)
        {
            var query = _context.Categories.AsQueryable();

            // Filter
            if (!string.IsNullOrEmpty(name))
                query = query.Where(c => c.Name!.Contains(name));
            if (!string.IsNullOrEmpty(description))
                query = query.Where(c => c.Description!.Contains(description));

            // Sort
            query = sortBy.ToLower() switch
            {
                "name" => isDescending ? query.OrderByDescending(c => c.Name) : query.OrderBy(c => c.Name),
                "prioritylevel" => isDescending ? query.OrderByDescending(c => c.PriorityLevel) : query.OrderBy(c => c.PriorityLevel),
                "averagevalue" => isDescending ? query.OrderByDescending(c => c.AverageValue) : query.OrderBy(c => c.AverageValue),
                _ => query.OrderBy(c => c.Name)
            };

            // Total items count
            var totalItems = await query.CountAsync();

            // Paging
            var categories = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                totalItems,   
                pageNumber,    
                pageSize,      
                categories   
            });


        }

        // GET: api/Category
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            return await _context.Categories.ToListAsync();
        }

        // GET: api/Category/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound();

            return category;
        }

        // POST: api/Category
        [HttpPost]
        public async Task<ActionResult<Category>> CreateCategory(Category category)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }

        // PUT: api/Category/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, Category category)
        {
            if (id != category.Id)
                return BadRequest();

            _context.Entry(category).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Categories.Any(c => c.Id == id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // DELETE: api/Category/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound();

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
