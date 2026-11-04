using Microsoft.EntityFrameworkCore;

// Находит регион по названию без учёта регистра или создаёт новый.
public static class RegionResolver
{
    // name == null: регион не передавали, остаётся fallbackId. Пустая строка очищает регион.
    public static async Task<int?> ResolveAsync(
        AppDbContext context,
        string? name,
        int? fallbackId,
        CancellationToken cancellationToken)
    {
        if (name is null)
            return fallbackId;

        var trimmed = name.Trim();
        if (trimmed.Length == 0)
            return null;

        var lower = trimmed.ToLower();
        var existing = await context.Regions
            .FirstOrDefaultAsync(region => region.Name.ToLower() == lower, cancellationToken);
        if (existing is not null)
            return existing.Id;

        var region = new Region { Name = trimmed, ImageUrl = string.Empty };
        context.Regions.Add(region);
        await context.SaveChangesAsync(cancellationToken);
        return region.Id;
    }
}
