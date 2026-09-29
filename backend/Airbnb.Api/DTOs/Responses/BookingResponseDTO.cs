public record BookingResponseDTO(
    int Id,
    int GuestId,
    int ListingId,
    DateTimeOffset CheckInDate,
    DateTimeOffset CheckOutDate,
    float TotalPrice,
    string Status
);