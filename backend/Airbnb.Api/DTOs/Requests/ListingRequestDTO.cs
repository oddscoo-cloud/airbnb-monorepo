public record ListingRequestDTO(
    string Title,
    string? Location,
    int RegionId,
    string? Category,
    string? Description,
    float PricePerNight,
    int MaxGuests,
    float Latitude,
    float Longtitude,
    List<int> AmenityIds
);