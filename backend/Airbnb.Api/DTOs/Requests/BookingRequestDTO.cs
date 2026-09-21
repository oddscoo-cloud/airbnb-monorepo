public record BookingRequestDTO(
    int ListingId,
    DateTimeOffset CheckInDate,
    DateTimeOffset CheckOutDate,
    float TotalPrice,
    string Status
);