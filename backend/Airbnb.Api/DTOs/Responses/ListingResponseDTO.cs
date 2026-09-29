public record ListingResponseDTO(
    int Id,
    int HostId,
    string Title,
    string? Location,
    string? Region,
    string? Category,
    string? Description,
    bool IsPublished,
    float PricePerNight,
    int MaxGuests,
    float Latitude,
    float Longtitude,
    List<ListingImageResponseDTO> Images,
    List<AmenityResponseDTO> Amenities,
    List<ReviewResponseDTO> Reviews,
    float? Rating,
    int ReviewCount
);