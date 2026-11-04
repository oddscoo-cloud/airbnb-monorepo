using System.ComponentModel.DataAnnotations;

public sealed class HostListingRequestDTO
{
    [Required, MaxLength(160)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(160)]
    public string Location { get; set; } = string.Empty;

    public int? RegionId { get; set; }

    [MaxLength(100)]
    public string? RegionName { get; set; }

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

    public List<IFormFile> Photos { get; set; } = [];
}

public sealed record RejectListingRequest([Required, MaxLength(1000)] string Reason);
