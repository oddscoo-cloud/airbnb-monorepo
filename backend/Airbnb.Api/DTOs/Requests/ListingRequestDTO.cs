public record ListingRequestDTO(
    string Title,
    string? Location,
    string? Region,
    string? Category,
    string? Description,
    float PricePerNight,
    int MaxGuests,
    float Latitude,
    float Longtitude
);