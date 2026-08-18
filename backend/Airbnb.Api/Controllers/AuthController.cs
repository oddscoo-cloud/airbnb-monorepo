using Microsoft.AspNetCore.Mvc;

namespace Airbnb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("register")]
    public IActionResult Register()
    {
        return Ok(new { message = "Пользователь успешно зарегистрирован" });
    }

    [HttpPost("login")]
    public IActionResult Login()
    {
        return Ok(new { token = "fake-jwt-token-for-demo" });
    }
}