using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("region")]
public class Region
{
    [Key]
    [Column("id")]
    public int Id { get; set; }
    [Column("name")]
    public required string Name { get; set; }
    [Column("image_url")]
    public required string ImageUrl { get; set; }


    public List<Listing> Listings { get; set; } = new();
}