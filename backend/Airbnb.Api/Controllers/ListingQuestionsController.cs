using Airbnb.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Airbnb.API.Controllers;

[ApiController]
[Route("api/listings")]
public sealed class ListingQuestionsController(
    AppDbContext context,
    ListingQuestionEmailSender emailSender) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("{listingId:int}/questions")]
    public async Task<IActionResult> Create(
        int listingId,
        CreateListingQuestionRequest request,
        CancellationToken cancellationToken)
    {
        var senderName = request.SenderName.Trim();
        var senderEmail = request.SenderEmail.Trim();
        var message = request.Message.Trim();
        if (senderName.Length == 0 || senderEmail.Length == 0 || message.Length == 0)
            return BadRequest(new { message = "Вкажіть ім’я, email і текст запитання." });

        var listing = await context.Listings
            .AsNoTracking()
            .Include(item => item.Host)
            .FirstOrDefaultAsync(item => item.Id == listingId && item.IsPublished, cancellationToken);
        if (listing?.Host is null)
            return NotFound(new { message = "Оголошення не знайдено." });

        var emailSent = await emailSender.SendAsync(
            listing.Host.Email,
            listing.Title,
            senderName,
            senderEmail,
            message,
            cancellationToken);
        if (!emailSent)
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { message = "Не вдалося надіслати лист власнику. Спробуйте пізніше." });

        return NoContent();
    }
}
