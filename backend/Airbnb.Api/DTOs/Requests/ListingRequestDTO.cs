public record ListingRequestDTO(
    string Title,
    string? Description,
    float PricePerNight,
    int MaxGuests,
    float Latitude,
    float Longtitude
);