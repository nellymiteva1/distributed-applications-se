using System;
using System.ComponentModel.DataAnnotations;


namespace LostAndFoundAPI.Models
{
    public class Item
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        public DateTime DateFoundOrLost { get; set; }

        [MaxLength(200)]
        public string? Location { get; set; }

        [Range(0, 100000)]
        public double EstimatedValue { get; set; }

        public bool IsClaimed { get; set; }

        // Връзка към User
        public int UserId { get; set; }
        public User? User { get; set; }

        // Връзка към Category
        [Required]
        public int CategoryId { get; set; }
        public Category? Category { get; set; }
    }
}
