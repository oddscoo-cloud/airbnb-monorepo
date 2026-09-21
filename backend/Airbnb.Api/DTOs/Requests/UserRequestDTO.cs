public record UserRequestDTO(
    string Email,
    string? PasswordHash,
    string FirstName,
    string LastName,
    string AvatarUrl
);