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

    [HttpGet]
    public async Task<IActionResult> GetPage(int page = 1, int pageSize = 24)
    {
        if (page < 1 || pageSize < 1)
            return BadRequest("page и pageSize должны быть больше 0");
        
        List<Listing> listings = await Context.Listings
            .Where(listing => listing.IsPublished)
            .Include(listing => listing.ListingImages)
            .Include(listing => listing.Reviews).ThenInclude(review => review.Author)
            .Include(listing => listing.Amenities)
            .AsNoTracking()
            .AsSplitQuery()
            .ToListAsync();

        long listingsCount = listings.Count;

        List<ListingResponseDTO> listingDTOs = listings
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(listing => new ListingResponseDTO(
                listing.Id,
                listing.HostId,
                listing.Title,
                listing.Location,
                listing.Region,
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
            listing.Region,
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

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody]ListingRequestDTO listingDTO)
    {
        if(listingDTO == null)
            return BadRequest(new { message = "Incorrect listing data" });
        
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userId, out var hostId))
            return Unauthorized();

        Listing listing = Mapper.Map<Listing>(listingDTO);
        listing.HostId = hostId;
        listing.IsPublished = false;
        Context.Add(listing);
        await Context.SaveChangesAsync();

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
}