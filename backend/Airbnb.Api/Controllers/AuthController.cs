using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Text.Json.Serialization;

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

    [HttpPost("facebook")]
    public async Task<IActionResult> FacebookLogin(
        [FromBody] FacebookLoginRequest request,
        IAuthService authService,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request?.AccessToken))
            return BadRequest(new { message = "AccessToken обязателен." });

        using var httpClient = new HttpClient();

        var fbResponse = await httpClient.GetAsync(
            $"https://graph.facebook.com/me?fields=id,email,first_name,last_name,picture&access_token={request.AccessToken}",
            cancellationToken);

        if (!fbResponse.IsSuccessStatusCode)
            return BadRequest(new { message = "Не удалось проверить токен Facebook." });

        var fbUser = await fbResponse.Content.ReadFromJsonAsync<FacebookProfileDto>(cancellationToken: cancellationToken);

        if (fbUser == null || string.IsNullOrEmpty(fbUser.Id))
            return BadRequest(new { message = "Не удалось получить данные профиля из Facebook." });

        string? avatarUrl = fbUser.Picture?.Data?.Url;
        string email = string.IsNullOrWhiteSpace(fbUser.Email) ? $"{fbUser.Id}@facebook.local" : fbUser.Email;

        var (tokens, error) = await authService.LoginOrRegisterWithFacebookAsync(
            facebookId: fbUser.Id,
            email: email,
            firstName: fbUser.FirstName,
            lastName: fbUser.LastName,
            avatarUrl: avatarUrl,
            cancellationToken: cancellationToken);

        if (error != null)
            return BadRequest(new { message = error });

        if (tokens != null)
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

public class FacebookLoginRequest
{
    public required string AccessToken { get; set; }
}

public class FacebookProfileDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("first_name")]
    public string? FirstName { get; set; }

    [JsonPropertyName("last_name")]
    public string? LastName { get; set; }

    [JsonPropertyName("picture")]
    public FacebookPictureWrapper? Picture { get; set; }
}

public class FacebookPictureWrapper
{
    [JsonPropertyName("data")]
    public FacebookPictureData? Data { get; set; }
}

public class FacebookPictureData
{
    [JsonPropertyName("url")]
    public string? Url { get; set; }
}