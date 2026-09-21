using Microsoft.EntityFrameworkCore;

public static class ListingsSeeder
{
    public static async Task Initialize(AppDbContext context)
    {
        if (context.Listings.Any())
        {
            return; 
        }
        List<Amenity> amenities = await context.Amenities.ToListAsync();
        var testListings = new List<Listing>
        {
            new Listing { HostId = 1, Title = "Listing1", Description = "Description", PricePerNight = 3.14f, MaxGuests = 3, Latitude = 13.14f, Longtitude = 13.14f, Amenities = {amenities[1]}},
            new Listing { HostId = 1, Title = "Listing2", Description = "Description", PricePerNight = 3.14f, MaxGuests = 4, Latitude = 13.14f, Longtitude = 13.14f, Amenities = {amenities[2]}},
            new Listing { HostId = 1, Title = "Listing3", Description = "Description", PricePerNight = 3.14f, MaxGuests = 5, Latitude = 13.14f, Longtitude = 13.14f, Amenities = {amenities[1]}},
            new Listing { HostId = 1, Title = "Listing4", Description = "Description", PricePerNight = 3.14f, MaxGuests = 6, Latitude = 13.14f, Longtitude = 13.14f, Amenities = {amenities[2]}},
            new Listing { HostId = 1, Title = "Listing5", Description = "Description", PricePerNight = 3.14f, MaxGuests = 7, Latitude = 13.14f, Longtitude = 13.14f, Amenities = {amenities[1]}},

            new Listing { HostId = 2, Title = "Listing6", Description = "Description", PricePerNight = 3.14f, MaxGuests = 3, Latitude = 13.14f, Longtitude = 13.14f, Amenities = {amenities[2], amenities[1]}},
            new Listing { HostId = 2, Title = "Listing7", Description = "Description", PricePerNight = 3.14f, MaxGuests = 4, Latitude = 13.14f, Longtitude = 13.14f, Amenities = {amenities[1], amenities[1]}},
            new Listing { HostId = 2, Title = "Listing8", Description = "Description", PricePerNight = 3.14f, MaxGuests = 5, Latitude = 13.14f, Longtitude = 13.14f, Amenities = {amenities[2], amenities[1]}},
            new Listing { HostId = 2, Title = "Listing9", Description = "Description", PricePerNight = 3.14f, MaxGuests = 6, Latitude = 13.14f, Longtitude = 13.14f, Amenities = {amenities[1], amenities[1]}},
            new Listing { HostId = 2, Title = "Listing10", Description = "Description", PricePerNight = 3.14f, MaxGuests = 7, Latitude = 13.14f, Longtitude = 13.14f, Amenities = {amenities[2], amenities[1]}},
        };
        context.Listings.AddRange(testListings);
        context.SaveChanges();
    }
}