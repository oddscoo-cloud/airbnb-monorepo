using Microsoft.EntityFrameworkCore;

// Общая логика создания пользовательских удобств (админ и заявки пользователей).
public static class AmenityCreator
{
    public const int MaxNameLength = 60;

    public static readonly string[] AllowedIcons =
    [
        "elevator", "washer", "air-conditioner", "kitchen", "hair-dryer", "parking",
        "wifi", "tv", "heating", "fridge", "workspace", "pets",
        "pool", "gym", "balcony", "security", "bath", "iron", "other",
    ];

    // Возвращает существующее удобство с таким именем либо создаёт новое.
    public static async Task<(Amenity? Amenity, string? Error)> GetOrCreateAsync(
        AppDbContext context, AmenityRequestDTO request, CancellationToken cancellationToken)
    {
        var name = (request.Name ?? string.Empty).Trim();
        if (name.Length == 0 || name.Length > MaxNameLength)
            return (null, $"Назва зручності має бути від 1 до {MaxNameLength} символів.");

        var icon = (request.Icon ?? string.Empty).Trim();
        if (!AllowedIcons.Contains(icon)) icon = "other";

        var lower = name.ToLower();
        var existing = await context.Amenities
            .FirstOrDefaultAsync(a => a.Name.ToLower() == lower, cancellationToken);
        if (existing is not null) return (existing, null);

        var amenity = new Amenity { Name = name, Icon = icon };
        context.Amenities.Add(amenity);
        await context.SaveChangesAsync(cancellationToken);
        return (amenity, null);
    }
}
