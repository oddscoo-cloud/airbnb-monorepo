using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

[Table("listings")]
public class Listing
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("host_id")]
    public required int HostId { get; set; }

    [Column("region_id")]
    public required int RegionId { get; set; }

    [Column("title")]
    public required string Title { get; set; }

    [Column("location")]
    public string? Location { get; set; }

    [Column("category")]
    public string? Category { get; set; }

    [Column("is_published")]
    public bool IsPublished { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("price_per_night")]
    public required float PricePerNight { get; set; }

    [Column("max_guests")]
    public required int MaxGuests { get; set; }

    [Column("latitude")]
    public required float Latitude { get; set; }

    [Column("longtitude")]
    public required float Longtitude { get; set; }




    [ForeignKey("HostId")]
    public User? Host { get; set; }
    [ForeignKey("RegionId")]
    public Region? Region { get; set; }

    public List<ListingImage> ListingImages { get; set; } = new();
    public List<Amenity> Amenities { get; set; } = new();
    public List<Review> Reviews { get; set; } = new();
    public List<Booking> Bookings { get; set; } = new();
    public List<SavedListing> SavedByUsers { get; set; } = new();
}
