using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

[Table("amenities")]
public class Amenity
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public required string Name { get; set; }

    [Column("icon")]
    public required string Icon { get; set; }




    public List<Listing> Listings { get; set; } = new();
}