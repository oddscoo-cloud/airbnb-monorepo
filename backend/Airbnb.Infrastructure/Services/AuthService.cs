using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Identity;

public interface IAuthService
{
    Task<(bool Success, string? Error, TokenResponse? Tokens)> RegisterAsync(
        RegisterRequest request, CancellationToken cancellationToken);
    Task<TokenResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
    Task<TokenResponse?> RefreshAsync(string rawRefreshToken, CancellationToken cancellationToken);
    Task LogoutAsync(string rawRefreshToken, CancellationToken cancellationToken);
    Task<(TokenResponse? Tokens, string? Error)> LoginOrRegisterWithFacebookAsync(string facebookId, string email,string? firstName, string? lastName,string? avatarUrl, CancellationToken cancellationToken);
}

public sealed class AuthService(
    IUserRepository users,
    IRefreshTokenRepository refreshTokens,
    IPasswordHasher<User> passwordHasher,
    IConfiguration configuration) : IAuthService
{
    private readonly string jwtKey = configuration["Jwt:Key"]
        ?? throw new InvalidOperationException("Jwt:Key is not configured.");
    private readonly string issuer = configuration["Jwt:Issuer"] ?? "Airbnb.Api";
    private readonly string audience = configuration["Jwt:Audience"] ?? "Airbnb.Web";
    private readonly TimeSpan accessLifetime = TimeSpan.FromMinutes(30);
    private readonly TimeSpan refreshLifetime = TimeSpan.FromDays(30);

    public async Task<(bool Success, string? Error, TokenResponse? Tokens)> RegisterAsync(
        RegisterRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (await users.FindByEmailAsync(email, cancellationToken) is not null)
            return (false, "Пользователь с таким email уже существует.", null);

        if (request.Password != request.ConfirmPassword)
            return (false, "Пароли не совпадают.", null);

        var user = new User
        {
            Email = email,
            FirstName = request.FirstName?.Trim() ?? string.Empty,
            LastName = request.LastName?.Trim() ?? string.Empty,
            AvatarUrl = string.Empty,
            Role = "Guest",
            CreatedAt = DateTimeOffset.UtcNow
        };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        await users.AddAsync(user, cancellationToken);
        await users.SaveChangesAsync(cancellationToken);
        return (true, null, null);
    }

    public async Task<TokenResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await users.FindByEmailAsync(request.Email.Trim().ToLowerInvariant(), cancellationToken);
        if (user is null || user.PasswordHash is null
            || passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password)
            == PasswordVerificationResult.Failed)
            return null;

        return await IssueTokensAsync(user, cancellationToken);
    }

    public async Task<(TokenResponse? Tokens, string? Error)> LoginOrRegisterWithFacebookAsync(
        string facebookId,
        string email,
        string? firstName,
        string? lastName,
        string? avatarUrl,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(facebookId))
            return (null, "Идентификатор Facebook не получен.");

        if (string.IsNullOrWhiteSpace(email))
            return (null, "Facebook не предоставил адрес электронной почты. Пожалуйста, предоставьте доступ к своему адресу электронной почты и попробуйте снова.");

        email = email.Trim().ToLowerInvariant();

        var user = await users.FindByFacebookIdAsync(
            facebookId,
            cancellationToken);

        if (user is null)
        {
            var existingUser = await users.FindByEmailAsync(
                email,
                cancellationToken);

            if (existingUser is not null)
            {
                return (
                    null,
                    "Учетная запись с таким адресом электронной почты уже существует. Пожалуйста, сначала войдите в систему стандартным способом."
                );
            }

            user = new User
            {
                Email = email,
                FacebookId = facebookId,
                FirstName = firstName?.Trim() ?? string.Empty,
                LastName = lastName?.Trim() ?? string.Empty,
                AvatarUrl = avatarUrl ?? string.Empty,
                Role = "Guest",
                CreatedAt = DateTimeOffset.UtcNow
            };

            await users.AddAsync(user, cancellationToken);
            await users.SaveChangesAsync(cancellationToken);
        }

        var tokens = await IssueTokensAsync(
            user,
            cancellationToken);

        return (tokens, null);
}

    public async Task<TokenResponse?> RefreshAsync(string rawRefreshToken, CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var token = await refreshTokens.FindActiveAsync(HashToken(rawRefreshToken), now, cancellationToken);
        if (token is null)
            return null;

        var user = await users.FindByIdAsync(token.UserId, cancellationToken);
        if (user is null)
            return null;

        token.IsRevoked = true;
        var response = await IssueTokensAsync(user, cancellationToken);
        await refreshTokens.SaveChangesAsync(cancellationToken);
        return response;
    }

    public async Task LogoutAsync(string rawRefreshToken, CancellationToken cancellationToken)
    {
        var token = await refreshTokens.FindActiveAsync(
            HashToken(rawRefreshToken), DateTimeOffset.UtcNow, cancellationToken);
        if (token is null)
            return;

        token.IsRevoked = true;
        await refreshTokens.SaveChangesAsync(cancellationToken);
    }

    private async Task<TokenResponse> IssueTokensAsync(User user, CancellationToken cancellationToken)
    {
        var accessExpiresAt = DateTimeOffset.UtcNow.Add(accessLifetime);
        var accessToken = new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            },
            expires: accessExpiresAt.UtcDateTime,
            signingCredentials: new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                SecurityAlgorithms.HmacSha256)));

        var rawRefreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        await refreshTokens.AddAsync(new RefreshToken
        {
            UserId = user.Id,
            Token = HashToken(rawRefreshToken),
            ExpiresAt = DateTimeOffset.UtcNow.Add(refreshLifetime),
            IsRevoked = false,
            CreatedAt = DateTimeOffset.UtcNow
        }, cancellationToken);
        await refreshTokens.SaveChangesAsync(cancellationToken);

        return new TokenResponse(accessToken, rawRefreshToken, accessExpiresAt, user.Role);
    }

    private static string HashToken(string rawToken) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));
}
