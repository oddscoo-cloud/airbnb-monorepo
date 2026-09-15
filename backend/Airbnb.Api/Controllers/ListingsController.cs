using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Airbnb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ListingsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(new[] 
        { 
            new { id = 1, title = "Уютные апартаменты", price = 1500 },
            new { id = 2, title = "Дом у моря", price = 3500 }
        });
    }

    [HttpPost]
    [Authorize]
    public IActionResult Create()
    {
        return Ok(new { message = "Объявление создано" });
    }
}