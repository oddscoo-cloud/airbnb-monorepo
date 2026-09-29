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
    public async Task<IActionResult> GetAll()
    {
        List<Listing> listings = await Context.Listings
            .Where(listing => listing.IsPublished)
            .Include(listing => listing.ListingImages)
            .Include(listing => listing.Reviews)
            .Include(listing => listing.Amenities)
            .AsNoTracking()
            .AsSplitQuery()
            .ToListAsync();

        List<ListingResponseDTO> listingDTOs = listings.Select(listing => new ListingResponseDTO(
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
            Mapper.Map<List<ReviewResponseDTO>>(listing.Reviews),
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
            .Include(item => item.Reviews)
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
            Mapper.Map<List<ReviewResponseDTO>>(listing.Reviews),
            listing.Reviews.Count == 0 ? null : listing.Reviews.Average(review => review.Rating),
            listing.Reviews.Count
        );
        return Ok(listingDTO);
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
}