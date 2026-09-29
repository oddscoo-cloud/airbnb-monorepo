public record ListingResponseDTO(
    int Id,
    int HostId,
    string Title,
    string? Description,
    float PricePerNight,
    int MaxGuests,
    float Latitude,
    float Longtitude
);