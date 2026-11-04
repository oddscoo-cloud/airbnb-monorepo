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
        var testRegions = new List<Region>
        {
            new Region { Id = 1, Name = "region1", ImageUrl = "placeholder" },
            new Region { Id = 2, Name = "region2", ImageUrl = "placeholder" }
        };
        context.Regions.AddRange(testRegions);

        var testListings = new List<Listing>
        {
            new Listing { HostId = 1, RegionId = 1, Title = "Listing1", Description = "Description", PricePerNight = 3.14f, MaxGuests = 3, Latitude = 13.14f, Longtitude = 13.14f},
            new Listing { HostId = 1, RegionId = 1, Title = "Listing2", Description = "Description", PricePerNight = 3.14f, MaxGuests = 4, Latitude = 13.14f, Longtitude = 13.14f},
            new Listing { HostId = 1, RegionId = 2, Title = "Listing3", Description = "Description", PricePerNight = 3.14f, MaxGuests = 5, Latitude = 13.14f, Longtitude = 13.14f},
            new Listing { HostId = 1, RegionId = 2, Title = "Listing4", Description = "Description", PricePerNight = 3.14f, MaxGuests = 6, Latitude = 13.14f, Longtitude = 13.14f},
            new Listing { HostId = 1, RegionId = 2, Title = "Listing5", Description = "Description", PricePerNight = 3.14f, MaxGuests = 7, Latitude = 13.14f, Longtitude = 13.14f},

            new Listing { HostId = 2, RegionId = 1, Title = "Listing6", Description = "Description", PricePerNight = 3.14f, MaxGuests = 3, Latitude = 13.14f, Longtitude = 13.14f},
            new Listing { HostId = 2, RegionId = 1, Title = "Listing7", Description = "Description", PricePerNight = 3.14f, MaxGuests = 4, Latitude = 13.14f, Longtitude = 13.14f},
            new Listing { HostId = 2, RegionId = 2, Title = "Listing8", Description = "Description", PricePerNight = 3.14f, MaxGuests = 5, Latitude = 13.14f, Longtitude = 13.14f},
            new Listing { HostId = 2, RegionId = 2, Title = "Listing9", Description = "Description", PricePerNight = 3.14f, MaxGuests = 6, Latitude = 13.14f, Longtitude = 13.14f},
            new Listing { HostId = 2, RegionId = 2, Title = "Listing10", Description = "Description", PricePerNight = 3.14f, MaxGuests = 7, Latitude = 13.14f, Longtitude = 13.14f},
        };

        context.Listings.AddRange(testListings);


        if (amenities.Count > 0)
        {
            testListings[0].Amenities.Add(amenities[0]);
            testListings[2].Amenities.Add(amenities[0]);
            testListings[4].Amenities.Add(amenities[0]);
            testListings[5].Amenities.Add(amenities[0]);
            testListings[7].Amenities.Add(amenities[0]);
        }

        if (amenities.Count > 1)
        {
            testListings[1].Amenities.Add(amenities[1]);
            testListings[2].Amenities.Add(amenities[1]);
            testListings[6].Amenities.Add(amenities[1]);
            testListings[7].Amenities.Add(amenities[1]);
            testListings[9].Amenities.Add(amenities[1]);
        }
        

        context.SaveChanges();
    }
}