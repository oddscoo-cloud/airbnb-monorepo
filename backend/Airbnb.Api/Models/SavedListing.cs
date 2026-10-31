using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("saved_listings")]
public class SavedListing
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public required int UserId { get; set; }

    [Column("listing_id")]
    public required int ListingId { get; set; }

    [Column("saved_at")]
    public DateTimeOffset SavedAt { get; set; } = DateTimeOffset.UtcNow;

    [ForeignKey("UserId")]
    public User? User { get; set; }

    [ForeignKey("ListingId")]
    public Listing? Listing { get; set; }
}
