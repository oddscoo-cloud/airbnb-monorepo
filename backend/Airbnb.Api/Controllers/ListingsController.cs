using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        List<Listing> listings = await Context.Listings.ToListAsync();
        List<ListingResponseDTO> listingDTOs = Mapper.Map<List<ListingResponseDTO>>(listings);
        return Ok(listingDTOs);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        Listing? listing = await Context.Listings.FindAsync(id);
        if(listing == null)
            return NotFound(new { message = $"Listing with id {id} not found"});
        ListingResponseDTO listingDTO = Mapper.Map<ListingResponseDTO>(listing);
        return Ok(listingDTO);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody]ListingRequestDTO listingDTO)
    {
        if(listingDTO == null)
            return BadRequest(new { message = "Incorrect listing data" });
        
        Listing listing = Mapper.Map<Listing>(listingDTO);
        Context.Add(listing);
        await Context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = listing.Id }, listing);
    }
}