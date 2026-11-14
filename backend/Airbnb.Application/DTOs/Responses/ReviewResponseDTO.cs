public record ReviewResponseDTO(
    int Id,
    float Rating,
    string Comment,
    DateTimeOffset CreatedAt,
    string? AuthorName,
    string? AvatarUrl,
    string? AuthorInitial
)
{
    public static string? GetAuthorInitial(User? author) =>
        string.IsNullOrWhiteSpace(author?.Email) ? null : author.Email.Trim()[..1].ToUpperInvariant();
}