using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;


namespace LostAndFoundAPI.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
            public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
            public string LastName { get; set; } = string.Empty;

        [Required]
            [MaxLength(100)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;



        [Required]
        [MinLength(6)]
        [MaxLength(100)] 
        public string Password { get; set; } = string.Empty;



        [MaxLength(15)]
        [Phone]
        public string? PhoneNumber { get; set; }

            public DateTime DateRegistered { get; set; }

            public bool IsActive { get; set; }

            [MaxLength(250)]
        [Url]
        public string? ProfilePictureUrl { get; set; }  

            public ICollection<Item>? Items { get; set; }
        
    }
}
