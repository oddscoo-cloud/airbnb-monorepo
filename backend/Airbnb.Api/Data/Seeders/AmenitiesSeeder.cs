public static class AmenitiesSeeder
{
    public static void Initialize(AppDbContext context)
    {
        if (context.Amenities.Any())
        {
            return; 
        }

        var testAmenities = new List<Amenity>
        {
            new Amenity { Name = "Amenity1", Icon = "url1" },
            new Amenity { Name = "Amenity2", Icon = "url2" }
        };

        context.Amenities.AddRange(testAmenities);
        context.SaveChanges();
    }
}
