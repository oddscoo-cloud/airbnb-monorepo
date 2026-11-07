using System.ComponentModel.DataAnnotations;

public sealed record CreateListingQuestionRequest
{
    [Required, StringLength(120, MinimumLength = 1)]
    public required string SenderName { get; init; }

    [Required, EmailAddress, StringLength(254)]
    public required string SenderEmail { get; init; }

    [Required, StringLength(2000, MinimumLength = 1)]
    public required string Message { get; init; }
}
