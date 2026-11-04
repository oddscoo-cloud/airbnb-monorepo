using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;

namespace Airbnb.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/submissions")]
public sealed class AdminSubmissionsController(AppDbContext context, IMapper mapper) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<ListingSubmissionResponseDTO>>> GetAll(
        [FromQuery] string? status,
        CancellationToken cancellationToken)
    {
        var query = context.Listings
            .Include(listing => listing.Host)
            .Include(listing => listing.Region)
            .Include(listing => listing.ListingImages)
            .Include(listing => listing.Amenities)
            .AsNoTracking()
            .AsSplitQuery()
            .Where(listing => listing.SubmittedAt != null);

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(listing => listing.ReviewStatus == status);

        var listings = await query.OrderByDescending(listing => listing.SubmittedAt).ToListAsync(cancellationToken);
        return Ok(listings.Select(listing => SubmissionMapper.ToResponse(listing, mapper)).ToList());
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ListingSubmissionResponseDTO>> Update(
        int id,
        AdminListingRequestDTO request,
        CancellationToken cancellationToken)
    {
        var listing = await context.Listings
            .Include(item => item.Host)
            .Include(item => item.ListingImages)
            .Include(item => item.Amenities)
            .FirstOrDefaultAsync(
                item => item.Id == id && item.ReviewStatus == ListingReviewStatus.Pending,
                cancellationToken);
        if (listing is null)
            return NotFound(new { message = "Заявку не знайдено або її вже розглянуто." });

        var amenityIds = request.AmenityIds.Distinct().ToList();
        listing.Title = request.Title.Trim();
        listing.Location = request.Location.Trim();
        listing.RegionId = await RegionResolver.ResolveAsync(context, request.RegionName, request.RegionId, cancellationToken);
        listing.Category = request.Category.Trim();
        listing.Description = request.Description?.Trim();
        listing.PricePerNight = request.PricePerNight;
        listing.MaxGuests = request.MaxGuests;
        listing.Latitude = request.Latitude;
        listing.Longtitude = request.Longtitude;
        listing.Amenities = amenityIds.Count == 0
            ? []
            : await context.Amenities.Where(amenity => amenityIds.Contains(amenity.Id)).ToListAsync(cancellationToken);

        await context.SaveChangesAsync(cancellationToken);
        await context.Entry(listing).Reference(item => item.Region).LoadAsync(cancellationToken);
        return Ok(SubmissionMapper.ToResponse(listing, mapper));
    }

    [HttpPost("{id:int}/approve")]
    public async Task<IActionResult> Approve(int id, CancellationToken cancellationToken)
    {
        var listing = await FindPending(id, cancellationToken);
        if (listing is null)
            return NotFound(new { message = "Заявку не знайдено або її вже розглянуто." });

        listing.ReviewStatus = ListingReviewStatus.Approved;
        listing.RejectionReason = null;
        listing.ReviewedAt = DateTimeOffset.UtcNow;
        listing.IsPublished = true;
        await context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:int}/reject")]
    public async Task<IActionResult> Reject(int id, RejectListingRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Reason))
            return BadRequest(new { message = "Вкажіть причину відхилення." });

        var listing = await FindPending(id, cancellationToken);
        if (listing is null)
            return NotFound(new { message = "Заявку не знайдено або її вже розглянуто." });

        listing.ReviewStatus = ListingReviewStatus.Rejected;
        listing.RejectionReason = request.Reason.Trim();
        listing.ReviewedAt = DateTimeOffset.UtcNow;
        listing.IsPublished = false;
        await context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private Task<Listing?> FindPending(int id, CancellationToken cancellationToken) =>
        context.Listings.FirstOrDefaultAsync(
            listing => listing.Id == id && listing.ReviewStatus == ListingReviewStatus.Pending,
            cancellationToken);
}
