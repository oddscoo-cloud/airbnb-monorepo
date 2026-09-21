public record UserResponseDTO(
    int Id,
    string Email,
    string FirstName,
    string LastName,
    string AvatarUrl,
    DateTimeOffset CreatedAt
);