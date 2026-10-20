using System.ComponentModel.DataAnnotations;

public sealed record ListingSearchRequest(
    [param: Range(1, 1000000)] int Page = 1,
    [param: Range(1, 100)] int PageSize = 100,
    string? Region = null,
    string? Category = null,
    [param: Range(0, float.MaxValue)] float? MinPrice = null,
    [param: Range(0, float.MaxValue)] float? MaxPrice = null,
    [param: Range(0, 5)] float? MinimumRating = null,
    [param: Range(1, 16)] int? Guests = null,
    DateOnly? CheckIn = null,
    DateOnly? CheckOut = null);