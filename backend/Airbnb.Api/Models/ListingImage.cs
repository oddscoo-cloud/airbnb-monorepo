using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

[Table("listing_images")]
public class ListingImage
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("listing_id")]
    public required int ListingId { get; set; }

    [Column("image_url")]
    public required string ImageUrl { get; set; }

    [Column("is_cover")]
    public required bool IsCover { get; set; }




    [ForeignKey("ListingId")]
    public Listing? Listing { get; set; }
}