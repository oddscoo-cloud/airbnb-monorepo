using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Text.Json.Serialization;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Json;

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

    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin(
        [FromBody] GoogleLoginRequest request,
        IAuthService authService,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request?.AccessToken))
            return BadRequest(new { message = "AccessToken обязателен." });

        using var httpClient = new HttpClient();

        var googleResponse = await httpClient.GetAsync(
            $"https://www.googleapis.com/oauth2/v3/userinfo?access_token={request.AccessToken}",
            cancellationToken);

        if (!googleResponse.IsSuccessStatusCode)
            return BadRequest(new { message = "Не удалось проверить токен Google." });

        var googleUser = await googleResponse.Content.ReadFromJsonAsync<GoogleProfileDto>(cancellationToken: cancellationToken);

        if (googleUser == null || string.IsNullOrEmpty(googleUser.Email))
            return BadRequest(new { message = "Не удалось получить данные профиля из Google." });

        var (tokens, error) = await authService.LoginOrRegisterWithGoogleAsync(
            googleId: googleUser.Sub ?? googleUser.Email,
            email: googleUser.Email,
            firstName: googleUser.GivenName,
            lastName: googleUser.FamilyName,
            avatarUrl: googleUser.Picture,
            cancellationToken: cancellationToken);

        if (error != null)
            return BadRequest(new { message = error });

        if (tokens != null)
            SetRefreshCookie(tokens.RefreshToken);

        return Ok(tokens);
    }

    [HttpPost("apple")]
    public async Task<IActionResult> AppleLogin(
        [FromBody] AppleLoginRequest request,
        IAuthService authService,
        [FromServices] IConfiguration configuration,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request?.IdToken))
            return BadRequest(new { message = "IdToken обязателен." });

        try
        {
            var handler = new JwtSecurityTokenHandler();
            if (!handler.CanReadToken(request.IdToken))
                return BadRequest(new { message = "Неверный формат токена Apple." });

            using var httpClient = new HttpClient();
            var jwksJson = await httpClient.GetStringAsync("https://appleid.apple.com/auth/keys", cancellationToken);
            var keys = new Microsoft.IdentityModel.Tokens.JsonWebKeySet(jwksJson).GetSigningKeys();

            var appleClientId = configuration["Authentication:Apple:ClientId"];

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = "https://appleid.apple.com",
                ValidateAudience = !string.IsNullOrEmpty(appleClientId),
                ValidAudience = appleClientId,
                ValidateIssuerSigningKey = true,
                IssuerSigningKeys = keys,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(5)
            };

            if (string.IsNullOrEmpty(appleClientId))
            {
                validationParameters.ValidateAudience = false;
            }

            var principal = handler.ValidateToken(request.IdToken, validationParameters, out var validatedToken);
            var jwt = (JwtSecurityToken)validatedToken;

            var email = principal.FindFirst(ClaimTypes.Email)?.Value 
                        ?? principal.FindFirst("email")?.Value 
                        ?? jwt.Claims.FirstOrDefault(c => c.Type == "email")?.Value;

            var appleId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                          ?? principal.FindFirst("sub")?.Value 
                          ?? jwt.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(appleId))
                return BadRequest(new { message = "Не удалось извлечь email или ID из токена Apple." });

            var (tokens, error) = await authService.LoginOrRegisterWithAppleAsync(
                appleId: appleId,
                email: email,
                firstName: request.FirstName,
                lastName: request.LastName,
                cancellationToken: cancellationToken);

            if (error != null)
                return BadRequest(new { message = error });

            if (tokens != null)
                SetRefreshCookie(tokens.RefreshToken);

            return Ok(tokens);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Ошибка проверки подписи токена Apple: " + ex.Message });
        }
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
    [JsonPropertyName("access_token")]
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

public class GoogleLoginRequest
{
    [JsonPropertyName("access_token")]
    public required string AccessToken { get; set; }
}

public class GoogleProfileDto
{
    [JsonPropertyName("sub")]
    public string? Sub { get; set; }

    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("given_name")]
    public string? GivenName { get; set; }

    [JsonPropertyName("family_name")]
    public string? FamilyName { get; set; }

    [JsonPropertyName("picture")]
    public string? Picture { get; set; }
}

public class AppleLoginRequest
{
    [JsonPropertyName("id_token")]
    public required string IdToken { get; set; }

    [JsonPropertyName("first_name")]
    public string? FirstName { get; set; }

    [JsonPropertyName("last_name")]
    public string? LastName { get; set; }
}