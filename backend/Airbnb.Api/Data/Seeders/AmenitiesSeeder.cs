public static class AmenitiesSeeder
{
    // Icon — ключ иконки, который сопоставляется с компонентом на фронтенде.
    private static readonly (string Name, string Icon)[] Defaults =
    [
        ("Ліфт", "elevator"),
        ("Пральна та сушильна машина", "washer"),
        ("Портативна система кондиціонування", "air-conditioner"),
        ("Укомплектована кухня", "kitchen"),
        ("Фен", "hair-dryer"),
        ("Паркінг", "parking"),
        ("Wi-Fi", "wifi"),
        ("Телевізор", "tv"),
        ("Опалення", "heating"),
        ("Холодильник", "fridge"),
        ("Робоче місце", "workspace"),
        ("Дозволено з тваринами", "pets"),
    ];

    public static void Initialize(AppDbContext context)
    {
        // Удаляем тестовые удобства, оставшиеся от старых версий сидера.
        var placeholders = context.Amenities
            .Where(a => a.Name == "Amenity1" || a.Name == "Amenity2")
            .ToList();
        context.Amenities.RemoveRange(placeholders);

        var existing = context.Amenities.ToList();
        foreach (var (name, icon) in Defaults)
        {
            var amenity = existing.FirstOrDefault(a => a.Name == name);
            if (amenity is null)
            {
                context.Amenities.Add(new Amenity { Name = name, Icon = icon });
            }
            else if (amenity.Icon != icon)
            {
                amenity.Icon = icon;
            }
        }

        context.SaveChanges();
    }
}
