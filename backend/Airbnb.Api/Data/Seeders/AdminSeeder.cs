using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

public static class AdminSeeder
{
    public static async Task Initialize(
        AppDbContext context,
        IPasswordHasher<User> passwordHasher,
        IConfiguration configuration,
        CancellationToken cancellationToken = default)
    {
        var email = configuration["Admin:Email"]?.Trim().ToLowerInvariant();
        var password = configuration["Admin:Password"];
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            return;

        var user = await context.Users.SingleOrDefaultAsync(item => item.Email == email, cancellationToken);
        if (user is null)
        {
            user = new User
            {
                Email = email,
                FirstName = "Site",
                LastName = "Admin",
                AvatarUrl = string.Empty,
                Role = "Admin",
                CreatedAt = DateTimeOffset.UtcNow
            };
            user.PasswordHash = passwordHasher.HashPassword(user, password);
            context.Users.Add(user);
        }
        else
        {
            user.Role = "Admin";
            user.PasswordHash = passwordHasher.HashPassword(user, password);
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}
