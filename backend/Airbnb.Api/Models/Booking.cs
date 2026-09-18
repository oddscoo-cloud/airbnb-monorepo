using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

[Table("bookings")]
public class Booking
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("guest_id")]
    public required int GuestId { get; set; }

    [Column("listing_id")]
    public required int ListingId { get; set; }

    [Column("check_in_date")]
    public DateTimeOffset CheckInDate { get; set; }

    [Column("check_out_date")]
    public DateTimeOffset CheckOutDate { get; set; }

    [Column("total_price")]
    public required float TotalPrice { get; set; }

    [Column("status")]
    public required string Status { get; set; }




    [ForeignKey("GuestId")]
    public User? Guest { get; set; }
    [ForeignKey("ListingId")]
    public Listing? Listing { get; set; }
}