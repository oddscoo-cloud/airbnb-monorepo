using System.ComponentModel.DataAnnotations;

/// <summary>Payload for creating a listing review.</summary>
public sealed record CreateReviewRequest
{
    [Range(1, 5)]
    public required float Rating { get; init; }

    [Required, StringLength(2000, MinimumLength = 1)]
    public required string Comment { get; init; }
}