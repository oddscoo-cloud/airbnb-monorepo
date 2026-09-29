using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

[Table("users")]
public class User
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("email")]
    public required string Email { get; set; }

    [Column("password_hash")]
    public string? PasswordHash { get; set; }

    [Column("first_name")]
    public required string FirstName { get; set; }

    [Column("last_name")]
    public required string LastName { get; set; }

    [Column("avatar_url")]
    public required string AvatarUrl { get; set; }
  
    [Column("role")]
    public string Role { get; set; } = "Guest";

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; }




    public List<RefreshToken> RefreshTokens { get; set; } = new();
    public List<Listing> Listings { get; set; } = new();
    public List<Review> Reviews { get; set; } = new();
    public List<Booking> Bookings { get; set; } = new();
    
}