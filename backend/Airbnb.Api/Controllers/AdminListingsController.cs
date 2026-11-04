using System.Security.Claims;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Airbnb.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/listings")]
public sealed class AdminListingsController(
    AppDbContext context,
    IMapper mapper,
    IWebHostEnvironment environment) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<ListingResponseDTO>>> GetAll(CancellationToken cancellationToken)
    {
        var listings = await context.Listings
            .Include(listing => listing.Region)
            .Include(listing => listing.ListingImages)
            .Include(listing => listing.Amenities)
            .Include(listing => listing.Reviews).ThenInclude(review => review.Author)
            .AsNoTracking()
            .AsSplitQuery()
            .OrderByDescending(listing => listing.Id)
            .ToListAsync(cancellationToken);

        return Ok(listings.Select(ToResponse).ToList());
    }

    [HttpGet("amenities", Name = "GetAdminAmenities")]
    public async Task<ActionResult<List<AmenityResponseDTO>>> GetAmenities(CancellationToken cancellationToken)
    {
        var amenities = await context.Amenities
            .AsNoTracking()
            .OrderBy(amenity => amenity.Name)
            .ToListAsync(cancellationToken);
        return Ok(mapper.Map<List<AmenityResponseDTO>>(amenities));
    }

    [HttpPost]
    public async Task<ActionResult<ListingResponseDTO>> Create(
        AdminListingRequestDTO request,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userId, out var hostId))
            return Unauthorized();

        var listing = new Listing
        {
            HostId = hostId,
            Title = request.Title.Trim(),
            Location = request.Location.Trim(),
            RegionId = request.RegionId,
            Category = request.Category.Trim(),
            Description = request.Description?.Trim(),
            PricePerNight = request.PricePerNight,
            MaxGuests = request.MaxGuests,
            Latitude = request.Latitude,
            Longtitude = request.Longtitude,
            IsPublished = false,
            Amenities = await GetAmenities(request.AmenityIds, cancellationToken)
        };

        context.Listings.Add(listing);
        await context.SaveChangesAsync(cancellationToken);
        await context.Entry(listing).Reference(item => item.Region).LoadAsync(cancellationToken);
        return CreatedAtAction(nameof(GetAll), ToResponse(listing));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ListingResponseDTO>> Update(
        int id,
        AdminListingRequestDTO request,
        CancellationToken cancellationToken)
    {
        var listing = await context.Listings
            .Include(item => item.ListingImages)
            .Include(item => item.Amenities)
            .Include(item => item.Reviews).ThenInclude(review => review.Author)
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (listing is null)
            return NotFound();

        listing.Title = request.Title.Trim();
        listing.Location = request.Location.Trim();
        listing.RegionId = request.RegionId;
        listing.Category = request.Category.Trim();
        listing.Description = request.Description?.Trim();
        listing.PricePerNight = request.PricePerNight;
        listing.MaxGuests = request.MaxGuests;
        listing.Latitude = request.Latitude;
        listing.Longtitude = request.Longtitude;
        listing.Amenities = await GetAmenities(request.AmenityIds, cancellationToken);

        await context.SaveChangesAsync(cancellationToken);
        await context.Entry(listing).Reference(item => item.Region).LoadAsync(cancellationToken);
        return Ok(ToResponse(listing));
    }

    [HttpPost("{id:int}/publish")]
    public async Task<IActionResult> SetPublished(
        int id,
        PublishListingRequest request,
        CancellationToken cancellationToken)
    {
        var listing = await context.Listings.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (listing is null)
            return NotFound();

        if (request.IsPublished &&
            (string.IsNullOrWhiteSpace(listing.Location) ||
             string.IsNullOrWhiteSpace(listing.Category)))
        {
            return BadRequest(new { message = "Перед публікацією вкажіть адресу і категорію." });
        }

        listing.IsPublished = request.IsPublished;
        await context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:int}/images")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ListingImageResponseDTO>> UploadImage(
        int id,
        IFormFile file,
        [FromForm] bool isCover,
        CancellationToken cancellationToken)
    {
        var listing = await context.Listings
            .Include(item => item.ListingImages)
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (listing is null)
            return NotFound();

        if (file.Length is <= 0 or > 12 * 1024 * 1024)
            return BadRequest(new { message = "Розмір фото має бути від 1 байта до 12 МБ." });

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (extension is not (".jpg" or ".jpeg" or ".png" or ".webp"))
            return BadRequest(new { message = "Підтримуються формати JPG, PNG і WebP." });

        var webRoot = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
        var imageDirectory = Path.Combine(webRoot, "listing-images");
        Directory.CreateDirectory(imageDirectory);

        var fileName = $"{Guid.NewGuid():N}{extension}";
        var fullPath = Path.Combine(imageDirectory, fileName);
        await using (var output = System.IO.File.Create(fullPath))
            await file.CopyToAsync(output, cancellationToken);

        var setAsCover = isCover || !listing.ListingImages.Any(image => image.IsCover);
        if (setAsCover)
        {
            foreach (var image in listing.ListingImages)
                image.IsCover = false;
        }

        var listingImage = new ListingImage
        {
            ListingId = listing.Id,
            ImageUrl = $"/listing-images/{fileName}",
            IsCover = setAsCover
        };
        context.ListingImages.Add(listingImage);
        await context.SaveChangesAsync(cancellationToken);

        return Ok(mapper.Map<ListingImageResponseDTO>(listingImage));
    }

    [HttpDelete("{id:int}/images/{imageId:int}")]
    public async Task<IActionResult> DeleteImage(int id, int imageId, CancellationToken cancellationToken)
    {
        var image = await context.ListingImages
            .FirstOrDefaultAsync(item => item.Id == imageId && item.ListingId == id, cancellationToken);
        if (image is null)
            return NotFound();

        var webRoot = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
        var filePath = Path.Combine(webRoot, "listing-images", Path.GetFileName(image.ImageUrl));
        context.ListingImages.Remove(image);
        await context.SaveChangesAsync(cancellationToken);
        if (System.IO.File.Exists(filePath))
            System.IO.File.Delete(filePath);
        return NoContent();
    }

    private async Task<List<Amenity>> GetAmenities(List<int> ids, CancellationToken cancellationToken)
    {
        if (ids.Count == 0)
            return [];

        return await context.Amenities
            .Where(amenity => ids.Contains(amenity.Id))
            .ToListAsync(cancellationToken);
    }

    private ListingResponseDTO ToResponse(Listing listing) => new(
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
        mapper.Map<List<ListingImageResponseDTO>>(listing.ListingImages),
        mapper.Map<List<AmenityResponseDTO>>(listing.Amenities),
        mapper.Map<List<ReviewResponseDTO>>(listing.Reviews),
        listing.Reviews.Count == 0 ? null : listing.Reviews.Average(review => review.Rating),
        listing.Reviews.Count);
}
