using System.ComponentModel.DataAnnotations;

public sealed class AdminListingRequestDTO
{
    [Required, MaxLength(160)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(160)]
    public string Location { get; set; } = string.Empty;

    [Required, MaxLength(120)]
    public string Region { get; set; } = string.Empty;

    [Required, MaxLength(80)]
    public string Category { get; set; } = string.Empty;

    [MaxLength(5000)]
    public string? Description { get; set; }

    [Range(1, 100000)]
    public float PricePerNight { get; set; }

    [Range(1, 30)]
    public int MaxGuests { get; set; }

    [Range(-90, 90)]
    public float Latitude { get; set; }

    [Range(-180, 180)]
    public float Longtitude { get; set; }

    public List<int> AmenityIds { get; set; } = [];
}

public sealed record PublishListingRequest(bool IsPublished);
