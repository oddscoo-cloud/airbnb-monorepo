public record ListingResponseDTO(
    int Id,
    int HostId,
    string Title,
    string? Location,
    string? Region,
    string? Category,
    string? Description,
    float PricePerNight,
    int MaxGuests,
    float Latitude,
    float Longtitude,
    List<ListingImageResponseDTO> Images,
    float? Rating,
    int ReviewCount
);