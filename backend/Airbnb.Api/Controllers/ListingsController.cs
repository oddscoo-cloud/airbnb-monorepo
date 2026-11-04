using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Airbnb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ListingsController : ControllerBase
{
    private readonly AppDbContext Context;
    private readonly IMapper Mapper;
    public ListingsController(AppDbContext context, IMapper mapper)
    {
        Context = context;
        Mapper = mapper;
    }

    [HttpGet("regions")]
    public async Task<IActionResult> GetRegions(CancellationToken cancellationToken)
    {
        var regions = await Context.Regions
            .Where(region => region.Listings.Any(listing => listing.IsPublished))
            .OrderBy(region => region)
            .ToListAsync(cancellationToken);

        return Ok(regions);
    }

    [HttpGet]
    public async Task<IActionResult> GetPage(
        [FromQuery] ListingSearchRequest request,
        CancellationToken cancellationToken)
    {
        if (request.MinPrice > request.MaxPrice)
            return BadRequest(new { message = "Мінімальна ціна не може перевищувати максимальну." });

        if (request.CheckIn.HasValue != request.CheckOut.HasValue ||
            (request.CheckIn.HasValue && request.CheckOut <= request.CheckIn))
        {
            return BadRequest(new { message = "Вкажіть коректний період заїзду та виїзду." });
        }

        IQueryable<Listing> query = Context.Listings
            .Where(listing => listing.IsPublished);

        if (!string.IsNullOrWhiteSpace(request.Region))
        {
            var region = request.Region.Trim().ToLowerInvariant();
            query = query.Where(listing => listing.Region != null && listing.Region.Name.ToLower() == region);
        }

        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            var category = request.Category.Trim();
            query = query.Where(listing => listing.Category == category);
        }

        if (request.MinPrice.HasValue)
            query = query.Where(listing => listing.PricePerNight >= request.MinPrice.Value);

        if (request.MaxPrice.HasValue)
            query = query.Where(listing => listing.PricePerNight <= request.MaxPrice.Value);

        if (request.MinimumRating.HasValue)
        {
            query = query.Where(listing => listing.Reviews.Any() &&
                listing.Reviews.Average(review => review.Rating) >= request.MinimumRating.Value);
        }

        if (request.Guests.HasValue)
            query = query.Where(listing => listing.MaxGuests >= request.Guests.Value);

        if (request.CheckIn.HasValue && request.CheckOut.HasValue)
        {
            var checkIn = new DateTimeOffset(request.CheckIn.Value.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);
            var checkOut = new DateTimeOffset(request.CheckOut.Value.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);

            query = query.Where(listing => !Context.Bookings.Any(booking =>
                booking.ListingId == listing.Id &&
                booking.CheckInDate < checkOut &&
                booking.CheckOutDate > checkIn &&
                booking.Status.ToLower() != "cancelled" &&
                booking.Status.ToLower() != "canceled" &&
                booking.Status.ToLower() != "rejected"));
        }

        var listings = await query
            .OrderBy(listing => listing.Id)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Include(listing => listing.Region)
            .Include(listing => listing.ListingImages)
            .Include(listing => listing.Reviews).ThenInclude(review => review.Author)
            .Include(listing => listing.Amenities)
            .AsNoTracking()
            .AsSplitQuery()
            .ToListAsync(cancellationToken);

        List<ListingResponseDTO> listingDTOs = listings
            .Select(listing => new ListingResponseDTO(
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
                Mapper.Map<List<ListingImageResponseDTO>>(listing.ListingImages),
                Mapper.Map<List<AmenityResponseDTO>>(listing.Amenities),
                listing.Reviews.Select(MapReview).ToList(),
                listing.Reviews.Count == 0 ? null : listing.Reviews.Average(review => review.Rating),
                listing.Reviews.Count
            )).ToList();
        return Ok(listingDTOs);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        Listing? listing = await Context.Listings
            .Where(item => item.IsPublished)
            .Include(item => item.Region)
            .Include(item => item.ListingImages)
            .Include(item => item.Reviews).ThenInclude(review => review.Author)
            .Include(item => item.Amenities)
            .AsNoTracking()
            .AsSplitQuery()
            .FirstOrDefaultAsync(item => item.Id == id);
        if(listing == null)
            return NotFound(new { message = $"Listing with id {id} not found"});
        ListingResponseDTO listingDTO = new(
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
            Mapper.Map<List<ListingImageResponseDTO>>(listing.ListingImages),
            Mapper.Map<List<AmenityResponseDTO>>(listing.Amenities),
            listing.Reviews.Select(MapReview).ToList(),
            listing.Reviews.Count == 0 ? null : listing.Reviews.Average(review => review.Rating),
            listing.Reviews.Count
        );
        return Ok(listingDTO);
    }

    [AllowAnonymous]
    [HttpPost("{id:int}/reviews")]
    public async Task<IActionResult> CreateReview(
        int id,
        [FromBody] CreateReviewRequest request,
        CancellationToken cancellationToken)
    {
        var listing = await Context.Listings
            .FirstOrDefaultAsync(item => item.Id == id && item.IsPublished, cancellationToken);
        if (listing is null)
            return NotFound(new { message = "Помешкання не знайдено." });

        User? author = null;
        if (int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var authorId))
        {
            author = await Context.Users.FirstOrDefaultAsync(user => user.Id == authorId, cancellationToken);
            if (author is null)
                return Unauthorized();
        }

        var review = new Review
        {
            ListingId = listing.Id,
            AuthorId = author?.Id,
            Author = author,
            Rating = request.Rating,
            Comment = request.Comment.Trim(),
            CreatedAt = DateTimeOffset.UtcNow
        };

        Context.Reviews.Add(review);
        await Context.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = listing.Id }, MapReview(review));
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ListingResponseDTO>> Create(
        ListingRequestDTO request,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userId, out var hostId))
            return Unauthorized();

        var user = await Context.Users.FindAsync(hostId);
        if (user == null)
            return Unauthorized();
        
        var listing = new Listing
        {
            HostId = hostId,
            Title = request.Title.Trim(),
            Location = request.Location?.Trim(),
            RegionId = request.RegionId,
            Category = request.Category?.Trim(),
            Description = request.Description?.Trim(),
            PricePerNight = request.PricePerNight,
            MaxGuests = request.MaxGuests,
            Latitude = request.Latitude,
            Longtitude = request.Longtitude,
            IsPublished = false,
            Amenities = await GetAmenities(request.AmenityIds, cancellationToken)
        };

        Context.Listings.Add(listing);
        await Context.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = listing.Id }, listing);
    }

    private static ReviewResponseDTO MapReview(Review review)
    {
        if (review.Author is null)
            return new ReviewResponseDTO(review.Id, review.Rating, review.Comment, review.CreatedAt, "Анонімний користувач", null);

        var fullName = $"{review.Author.FirstName} {review.Author.LastName}".Trim();
        var authorName = string.IsNullOrWhiteSpace(fullName)
            ? review.Author.Email.Split('@')[0]
            : fullName;
        var avatarUrl = string.IsNullOrWhiteSpace(review.Author.AvatarUrl) ? null : review.Author.AvatarUrl;

        return new ReviewResponseDTO(review.Id, review.Rating, review.Comment, review.CreatedAt, authorName, avatarUrl);
    }

    private async Task<List<Amenity>> GetAmenities(List<int> ids, CancellationToken cancellationToken)
    {
        if (ids.Count == 0)
            return [];

        return await Context.Amenities
            .Where(amenity => ids.Contains(amenity.Id))
            .ToListAsync(cancellationToken);
    }

    
}