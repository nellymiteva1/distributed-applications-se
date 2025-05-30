using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;


namespace LostAndFoundAPI.Models
{
    public class Category
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(250)]
        public string? Description { get; set; }

        [Range(1, 5)]
        public int PriorityLevel { get; set; }

        public bool IsActive { get; set; }

        [Range(0, 100000)]
        public double AverageValue { get; set; }

        public long TotalItemsFound { get; set; }

        public ICollection<Item>? Items { get; set; }
    }
}
