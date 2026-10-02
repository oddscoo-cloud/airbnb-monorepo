using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

[Table("reviews")]
public class Review
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("listing_id")]
    public required int ListingId { get; set; }

    [Column("author_id")]
    public int? AuthorId { get; set; }

    [Column("rating")]
    public required float Rating { get; set; }

    [Column("comment")]
    public required string Comment { get; set; }
    
    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; }




    [ForeignKey("ListingId")]
    public Listing? Listing { get; set; }
    [ForeignKey("AuthorId")]
    public User? Author { get; set; }
    
}