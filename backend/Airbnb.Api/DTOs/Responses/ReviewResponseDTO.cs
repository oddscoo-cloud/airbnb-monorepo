public record ReviewResponseDTO(
    int Id,
    float Rating,
    string Comment,
    DateTimeOffset CreatedAt
);