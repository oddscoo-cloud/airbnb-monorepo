using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Airbnb.API.Controllers;

[ApiController]
[Route("api/saved-listings")]
[Authorize]
public class SavedListingsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public SavedListingsController(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    // GET /api/saved-listings — всі збережені для поточного користувача
    [HttpGet]
    public async Task<IActionResult> GetSaved(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var saved = await _context.SavedListings
            .Where(s => s.UserId == userId.Value)
            .Include(s => s.Listing)
                .ThenInclude(l => l!.ListingImages)
            .Include(s => s.Listing)
                .ThenInclude(l => l!.Reviews)
                    .ThenInclude(r => r.Author)
            .Include(s => s.Listing)
                .ThenInclude(l => l!.Amenities)
            .AsNoTracking()
            .AsSplitQuery()
            .ToListAsync(cancellationToken);

        var listings = saved
            .Where(s => s.Listing != null && s.Listing.IsPublished)
            .Select(s => MapListing(s.Listing!))
            .ToList();

        return Ok(listings);
    }

    // GET /api/saved-listings/ids — тільки ідентифікатори збережених (для швидкої перевірки)
    [HttpGet("ids")]
    public async Task<IActionResult> GetSavedIds(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var ids = await _context.SavedListings
            .Where(s => s.UserId == userId.Value)
            .Select(s => s.ListingId)
            .ToListAsync(cancellationToken);

        return Ok(ids);
    }

    // POST /api/saved-listings/{listingId} — зберегти оголошення
    [HttpPost("{listingId:int}")]
    public async Task<IActionResult> Save(int listingId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var listingExists = await _context.Listings
            .AnyAsync(l => l.Id == listingId && l.IsPublished, cancellationToken);
        if (!listingExists)
            return NotFound(new { message = "Оголошення не знайдено." });

        var alreadySaved = await _context.SavedListings
            .AnyAsync(s => s.UserId == userId.Value && s.ListingId == listingId, cancellationToken);
        if (alreadySaved)
            return Conflict(new { message = "Вже збережено." });

        _context.SavedListings.Add(new SavedListing
        {
            UserId = userId.Value,
            ListingId = listingId,
            SavedAt = DateTimeOffset.UtcNow
        });
        await _context.SaveChangesAsync(cancellationToken);

        return StatusCode(StatusCodes.Status201Created);
    }

    // DELETE /api/saved-listings/{listingId} — прибрати зі збережених
    [HttpDelete("{listingId:int}")]
    public async Task<IActionResult> Unsave(int listingId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var entry = await _context.SavedListings
            .FirstOrDefaultAsync(s => s.UserId == userId.Value && s.ListingId == listingId, cancellationToken);

        if (entry is null)
            return NotFound(new { message = "Не знайдено у збережених." });

        _context.SavedListings.Remove(entry);
        await _context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private int? GetUserId()
    {
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(raw, out var id) ? id : null;
    }

    private static ListingResponseDTO MapListing(Listing listing)
    {
        var images = listing.ListingImages ?? new();
        var reviews = listing.Reviews ?? new();
        var amenities = listing.Amenities ?? new();

        return new ListingResponseDTO(
            listing.Id,
            listing.HostId,
            listing.Title,
            listing.Location,
            listing.Region?.Name,
            listing.Category,
            listing.Description,
            listing.IsPublished,
            listing.PricePerNight,
            listing.MaxGuests,
            listing.Latitude,
            listing.Longtitude,
            images.Select(i => new ListingImageResponseDTO(i.Id, i.ImageUrl, i.IsCover)).ToList(),
            amenities.Select(a => new AmenityResponseDTO(a.Id, a.Name, a.Icon)).ToList(),
            reviews.Select(r =>
            {
                if (r.Author is null)
                    return new ReviewResponseDTO(r.Id, r.Rating, r.Comment, r.CreatedAt, "Анонімний користувач", null);
                var fullName = $"{r.Author.FirstName} {r.Author.LastName}".Trim();
                var name = string.IsNullOrWhiteSpace(fullName) ? r.Author.Email.Split('@')[0] : fullName;
                var avatar = string.IsNullOrWhiteSpace(r.Author.AvatarUrl) ? null : r.Author.AvatarUrl;
                return new ReviewResponseDTO(r.Id, r.Rating, r.Comment, r.CreatedAt, name, avatar);
            }).ToList(),
            reviews.Count == 0 ? null : reviews.Average(r => r.Rating),
            reviews.Count
        );
    }
}
