using System.Security.Claims;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;

namespace Airbnb.API.Controllers;

// Заявки пользователей на добавление жилья. Доступно только верифицированным пользователям.
[ApiController]
[Authorize]
[Route("api/host/listings")]
public sealed class HostListingsController(
    AppDbContext context,
    IMapper mapper,
    IWebHostEnvironment environment) : ControllerBase
{
    private const int MaxPhotos = 15;
    private const long MaxPhotoBytes = 12 * 1024 * 1024;
    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    [HttpGet("amenities")]
    public async Task<ActionResult<List<AmenityResponseDTO>>> GetAmenities(CancellationToken cancellationToken)
    {
        var amenities = await context.Amenities
            .AsNoTracking()
            .OrderBy(amenity => amenity.Name)
            .ToListAsync(cancellationToken);
        return Ok(mapper.Map<List<AmenityResponseDTO>>(amenities));
    }

    [HttpPost("amenities")]
    public async Task<ActionResult<AmenityResponseDTO>> CreateAmenity(
        AmenityRequestDTO request, CancellationToken cancellationToken)
    {
        var (amenity, error) = await AmenityCreator.GetOrCreateAsync(context, request, cancellationToken);
        if (amenity is null) return BadRequest(new { message = error });
        return Ok(mapper.Map<AmenityResponseDTO>(amenity));
    }

    [HttpGet("mine")]
    public async Task<ActionResult<List<ListingSubmissionResponseDTO>>> GetMine(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        var listings = await context.Listings
            .Include(listing => listing.Host)
            .Include(listing => listing.Region)
            .Include(listing => listing.ListingImages)
            .Include(listing => listing.Amenities)
            .AsNoTracking()
            .AsSplitQuery()
            .Where(listing => listing.HostId == userId && listing.SubmittedAt != null)
            .OrderByDescending(listing => listing.SubmittedAt)
            .ToListAsync(cancellationToken);

        return Ok(listings.Select(listing => SubmissionMapper.ToResponse(listing, mapper)).ToList());
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(200 * 1024 * 1024)]
    public async Task<ActionResult<ListingSubmissionResponseDTO>> Submit(
        [FromForm] SubmitionRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        var user = await context.Users.AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == userId, cancellationToken);
        if (user is null)
            return Unauthorized();
        if (!user.IsVerified)
            return StatusCode(StatusCodes.Status403Forbidden,
                new { message = "Щоб запропонувати помешкання, спочатку пройдіть верифікацію." });

        if (request.Photos.Count is 0 or > MaxPhotos)
            return BadRequest(new { message = $"Додайте від 1 до {MaxPhotos} фото." });

        foreach (var photo in request.Photos)
        {
            if (photo.Length is <= 0 or > MaxPhotoBytes)
                return BadRequest(new { message = "Розмір кожного фото має бути від 1 байта до 12 МБ." });
            if (!AllowedExtensions.Contains(Path.GetExtension(photo.FileName).ToLowerInvariant()))
                return BadRequest(new { message = "Підтримуються формати JPG, PNG і WebP." });
        }

        var amenityIds = request.AmenityIds.Distinct().ToList();
        var listing = new Listing
        {
            HostId = userId,
            Title = request.Title.Trim(),
            Location = request.Location.Trim(),
            RegionId = await RegionResolver.ResolveAsync(context, request.RegionName, request.RegionId, cancellationToken),
            Category = request.Category.Trim(),
            Description = request.Description?.Trim(),
            PricePerNight = request.PricePerNight,
            MaxGuests = request.MaxGuests,
            Latitude = request.Latitude,
            Longtitude = request.Longtitude,
            IsPublished = false,
            ReviewStatus = ListingReviewStatus.Pending,
            SubmittedAt = DateTimeOffset.UtcNow,
            Amenities = amenityIds.Count == 0
                ? []
                : await context.Amenities.Where(amenity => amenityIds.Contains(amenity.Id)).ToListAsync(cancellationToken)
        };

        var webRoot = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
        var imageDirectory = Path.Combine(webRoot, "listing-images");
        Directory.CreateDirectory(imageDirectory);

        var savedPaths = new List<string>();
        try
        {
            foreach (var photo in request.Photos)
            {
                var fileName = $"{Guid.NewGuid():N}{Path.GetExtension(photo.FileName).ToLowerInvariant()}";
                var fullPath = Path.Combine(imageDirectory, fileName);
                await using (var output = System.IO.File.Create(fullPath))
                    await photo.CopyToAsync(output, cancellationToken);
                savedPaths.Add(fullPath);

                listing.ListingImages.Add(new ListingImage
                {
                    ListingId = 0,
                    ImageUrl = $"/listing-images/{fileName}",
                    IsCover = listing.ListingImages.Count == 0
                });
            }

            context.Listings.Add(listing);
            await context.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            foreach (var path in savedPaths.Where(System.IO.File.Exists))
                System.IO.File.Delete(path);
            throw;
        }

        await context.Entry(listing).Reference(item => item.Region).LoadAsync(cancellationToken);
        listing.Host = new User { Id = user.Id, Email = user.Email, AvatarUrl = user.AvatarUrl, FirstName = user.FirstName, LastName = user.LastName };
        return Ok(SubmissionMapper.ToResponse(listing, mapper));
    }

    private bool TryGetUserId(out int userId) =>
        int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
}

public static class SubmissionMapper
{
    public static ListingSubmissionResponseDTO ToResponse(Listing listing, IMapper mapper) => new(
        listing.Id,
        listing.HostId,
        listing.Host?.Email ?? string.Empty,
        listing.Host is null ? null : $"{listing.Host.FirstName} {listing.Host.LastName}".Trim() is { Length: > 0 } name ? name : null,
        listing.Title,
        listing.Location,
        listing.Region?.Name,
        listing.Category,
        listing.Description,
        listing.PricePerNight,
        listing.MaxGuests,
        listing.Latitude,
        listing.Longtitude,
        listing.ReviewStatus,
        listing.RejectionReason,
        listing.SubmittedAt,
        listing.ReviewedAt,
        mapper.Map<List<ListingImageResponseDTO>>(listing.ListingImages),
        mapper.Map<List<AmenityResponseDTO>>(listing.Amenities));
}
