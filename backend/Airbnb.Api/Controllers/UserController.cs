using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Airbnb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext Context;
    private readonly IMapper Mapper;
    public UsersController(AppDbContext context, IMapper mapper)
    {
        Context = context;
        Mapper = mapper;
    }


    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var users = await Context.Users
            .OrderBy(user => user.Id)
            .AsNoTracking()
            .AsSplitQuery()
            .ToListAsync(cancellationToken);

        List<UserResponseDTO> userDTOs = users
            .Select(user => new UserResponseDTO(
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName,
                user.AvatarUrl,
                user.CreatedAt,
                null,
                user.Role,
                user.IsVerified
            )).ToList();
        return Ok(userDTOs);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        User? user = await Context.Users
            .Include(user => user.Facts)
            .AsNoTracking()
            .AsSplitQuery()
            .FirstOrDefaultAsync(user => user.Id == id);
        if(user == null)
            return NotFound(new { message = $"User with id {id} not found"});
        await EnsureUserHasFacts(Context, user);
        UserResponseDTO userDTO = new(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.AvatarUrl,
            user.CreatedAt,
            Mapper.Map<ProfileFactsResponseDTO>(user.Facts),
            user.Role,
            user.IsVerified
        );
        return Ok(userDTO);
    }

    private const long MaxDocumentBytes = 5 * 1024 * 1024;
    private static readonly string[] AllowedDocumentTypes = ["driver", "passport", "id"];

    [Authorize]
    [HttpPost("me/verification")]
    [RequestSizeLimit(2 * MaxDocumentBytes + 1024 * 1024)]
    public async Task<IActionResult> SubmitVerification(
        [FromForm] string documentType,
        [FromForm] string country,
        IFormFile front,
        IFormFile back,
        [FromServices] IWebHostEnvironment environment,
        CancellationToken cancellationToken)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out int userId))
            return Unauthorized();
        if (!AllowedDocumentTypes.Contains(documentType) || string.IsNullOrWhiteSpace(country))
            return BadRequest(new { message = "Невірний тип документа або країна." });

        User? user = await Context.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user == null)
            return NotFound(new { message = "Користувача не знайдено." });

        string? frontExtension = await GetImageExtensionAsync(front, cancellationToken);
        string? backExtension = await GetImageExtensionAsync(back, cancellationToken);
        if (frontExtension == null || backExtension == null)
            return BadRequest(new { message = "Дозволені лише JPEG або PNG до 5 МБ." });

        // Документи зберігаються поза wwwroot, щоб вони не були доступні за публічним URL.
        string directory = Path.Combine(environment.ContentRootPath, "App_Data", "verification", userId.ToString());
        Directory.CreateDirectory(directory);
        await SaveFileAsync(front, Path.Combine(directory, "front" + frontExtension), cancellationToken);
        await SaveFileAsync(back, Path.Combine(directory, "back" + backExtension), cancellationToken);

        user.IsVerified = true;
        user.VerifiedAt = DateTimeOffset.UtcNow;
        await Context.SaveChangesAsync(cancellationToken);
        return Ok(new { isVerified = true });
    }

    private static async Task<string?> GetImageExtensionAsync(IFormFile file, CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0 || file.Length > MaxDocumentBytes)
            return null;
        byte[] header = new byte[8];
        await using Stream stream = file.OpenReadStream();
        int read = await stream.ReadAtLeastAsync(header, header.Length, false, cancellationToken);
        if (read >= 3 && header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF)
            return ".jpg";
        byte[] png = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
        return read == 8 && header.SequenceEqual(png) ? ".png" : null;
    }

    private static async Task SaveFileAsync(IFormFile file, string path, CancellationToken cancellationToken)
    {
        await using FileStream target = System.IO.File.Create(path);
        await file.CopyToAsync(target, cancellationToken);
    }

    private static async Task EnsureUserHasFacts(AppDbContext context, User user)
    {
        if (user.Facts != null)
            return;
        ProfileFacts facts = new ProfileFacts { UserId = user.Id };

        context.Facts.Add(facts);
        await context.SaveChangesAsync();
    }

}