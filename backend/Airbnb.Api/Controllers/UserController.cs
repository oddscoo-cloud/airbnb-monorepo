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
                null
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
            Mapper.Map<ProfileFactsResponseDTO>(user.Facts)
        );
        return Ok(userDTO);
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