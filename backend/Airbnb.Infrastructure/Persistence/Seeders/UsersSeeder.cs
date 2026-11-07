public static class UserSeeder
{
    public static void Initialize(AppDbContext context)
    {
        if (context.Users.Any())
        {
            return; 
        }

        var testUsers = new List<User>
        {
            new User { Email = "Name1@example.com", FirstName = "FirstName1", LastName = "LastName1", AvatarUrl = "url1" },
            new User { Email = "Name2@example.com", FirstName = "FirstName2", LastName = "LastName2", AvatarUrl = "url2" }
        };

        context.Users.AddRange(testUsers);
        context.SaveChanges();
    }
}
