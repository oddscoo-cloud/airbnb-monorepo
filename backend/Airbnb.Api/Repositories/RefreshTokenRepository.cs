using Microsoft.EntityFrameworkCore;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> FindActiveAsync(string tokenHash, DateTimeOffset now, CancellationToken cancellationToken);
    Task AddAsync(RefreshToken token, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}

public sealed class RefreshTokenRepository(AppDbContext db) : IRefreshTokenRepository
{
    public Task<RefreshToken?> FindActiveAsync(
        string tokenHash,
        DateTimeOffset now,
        CancellationToken cancellationToken) =>
        db.RefreshTokens
            .SingleOrDefaultAsync(token => token.Token == tokenHash &&
                                           !token.IsRevoked &&
                                           token.ExpiresAt > now,
                                  cancellationToken);

    public async Task AddAsync(RefreshToken token, CancellationToken cancellationToken) =>
        await db.RefreshTokens.AddAsync(token, cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        db.SaveChangesAsync(cancellationToken);
}
