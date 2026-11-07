using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Facebook;
using Microsoft.AspNetCore.Mvc;

namespace Airbnb.API.Controllers;

[ApiController]
[Route("api/facebook-auth")]
public class FacebookAuthController : ControllerBase
{
    private const string ExternalScheme = "External";
    private const string RefreshCookieName = "refresh_token";

    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

    public FacebookAuthController(
        IAuthService authService,
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        _authService = authService;
        _configuration = configuration;
        _environment = environment;
    }

    [HttpGet("login")]
    public IActionResult Login()
    {
        var properties = new AuthenticationProperties
        {
            RedirectUri = "/api/facebook-auth/callback"
        };

        return Challenge(
            properties,
            FacebookDefaults.AuthenticationScheme);
    }

    [HttpGet("callback")]
    public async Task<IActionResult> Callback(
        CancellationToken cancellationToken)
    {
        var externalResult =
            await HttpContext.AuthenticateAsync(ExternalScheme);

        if (!externalResult.Succeeded ||
            externalResult.Principal is null)
        {
            return RedirectToFrontend(
                "facebook_error",
                "Facebook authentication failed.");
        }

        var principal = externalResult.Principal;

        var facebookId =
            principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? principal.FindFirstValue("urn:facebook:id");

        var email =
            principal.FindFirstValue(ClaimTypes.Email);

        var firstName =
            principal.FindFirstValue(ClaimTypes.GivenName);

        var lastName =
            principal.FindFirstValue(ClaimTypes.Surname);

        var avatarUrl =
            principal.FindFirstValue("urn:facebook:picture");

        await HttpContext.SignOutAsync(ExternalScheme);

        if (string.IsNullOrWhiteSpace(facebookId))
        {
            return RedirectToFrontend(
                "facebook_error",
                "Facebook ID was not received.");
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            return RedirectToFrontend(
                "facebook_error",
                "Facebook did not provide your email. Please allow email access.");
        }

        var result =
            await _authService.LoginOrRegisterWithFacebookAsync(
                facebookId,
                email,
                firstName,
                lastName,
                avatarUrl,
                cancellationToken);

        if (result.Tokens is null)
        {
            return RedirectToFrontend(
                "facebook_error",
                result.Error ?? "Facebook login failed.");
        }

        var tokens = result.Tokens;

        Response.Cookies.Append(
            RefreshCookieName,
            tokens.RefreshToken,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = !_environment.IsDevelopment(),
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddDays(30),
                IsEssential = true,
                Path = "/"
            });

        var frontendUrl =
            _configuration["Frontend:BaseUrl"]
            ?? "http://localhost:5173";

        frontendUrl = frontendUrl.TrimEnd('/');

        var fragment =
            "facebook_access_token=" +
            Uri.EscapeDataString(tokens.AccessToken) +
            "&email=" +
            Uri.EscapeDataString(email) +
            "&role=" +
            Uri.EscapeDataString(tokens.Role);

        return Redirect(frontendUrl + "/#" + fragment);
    }

    private IActionResult RedirectToFrontend(
        string parameter,
        string message)
    {
        var frontendUrl =
            _configuration["Frontend:BaseUrl"]
            ?? "http://localhost:5173";

        frontendUrl = frontendUrl.TrimEnd('/');

        return Redirect(
            frontendUrl +
            "/#" +
            parameter +
            "=" +
            Uri.EscapeDataString(message));
    }
}