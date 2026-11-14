using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Airbnb.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(
        RegisterRequest request,
        IAuthService authService,
        CancellationToken cancellationToken)
    {
        var result = await authService.RegisterAsync(request, cancellationToken);
        if (!result.Success)
            return Conflict(new { message = result.Error });

        return StatusCode(StatusCodes.Status201Created,
            new { message = "Пользователь успешно зарегистрирован", role = "Guest" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        LoginRequest request,
        IAuthService authService,
        CancellationToken cancellationToken)
    {
        var tokens = await authService.LoginAsync(request, cancellationToken);
        if (tokens is null)
            return Unauthorized(new { message = "Неверный email или пароль." });

        SetRefreshCookie(tokens.RefreshToken);
        return Ok(tokens);
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me() => Ok(new
    {
        id = User.FindFirstValue(ClaimTypes.NameIdentifier),
        email = User.FindFirstValue(ClaimTypes.Email),
        role = User.FindFirstValue(ClaimTypes.Role)
    });

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(
        RefreshRequest request,
        IAuthService authService,
        CancellationToken cancellationToken)
    {
        var rawToken = request.RefreshToken ?? Request.Cookies[RefreshCookieName];
        if (string.IsNullOrWhiteSpace(rawToken))
            return Unauthorized(new { message = "Refresh token не предоставлен." });

        var tokens = await authService.RefreshAsync(rawToken, cancellationToken);
        if (tokens is null)
            return Unauthorized(new { message = "Refresh token недействителен или истек." });

        SetRefreshCookie(tokens.RefreshToken);
        return Ok(tokens);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(
        RefreshRequest request,
        IAuthService authService,
        CancellationToken cancellationToken)
    {
        var rawToken = request.RefreshToken ?? Request.Cookies[RefreshCookieName];
        if (!string.IsNullOrWhiteSpace(rawToken))
            await authService.LogoutAsync(rawToken, cancellationToken);

        Response.Cookies.Delete(RefreshCookieName);
        return NoContent();
    }

    private const string RefreshCookieName = "refresh_token";

    private void SetRefreshCookie(string token)
    {
        Response.Cookies.Append(RefreshCookieName, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(30),
            IsEssential = true
        });
    }
}