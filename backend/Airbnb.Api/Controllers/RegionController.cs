using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Airbnb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RegionController : ControllerBase
{
    private readonly AppDbContext Context;
    private readonly IMapper Mapper;
    public RegionController(AppDbContext context, IMapper mapper)
    {
        Context = context;
        Mapper = mapper;
    }

    [HttpGet]
    public async Task<IActionResult> GetRegions(CancellationToken cancellationToken)
    {
        var regions = await Context.Regions
            .Where(region => region.Listings.Any(listing => listing.IsPublished))
            .OrderBy(region => region)
            .ToListAsync(cancellationToken);

        return Ok(regions);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody]RegionRequestDTO regionDTO)
    {
        if(regionDTO == null)
            return BadRequest(new { message = "Incorrect listing data" });
        
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userId, out var hostId))
            return Unauthorized();

        Region region = Mapper.Map<Region>(regionDTO);
        Context.Add(region);
        await Context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRegions), region);
    }
}