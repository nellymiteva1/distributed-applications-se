using Microsoft.EntityFrameworkCore;
using LostAndFoundAPI.Models;

namespace LostAndFoundAPI.Data
{
    public class LostAndFoundContext : DbContext
    {
        public LostAndFoundContext(DbContextOptions<LostAndFoundContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Item> Items { get; set; }
    }
}