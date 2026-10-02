using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Listing> Listings { get; set; } = null!;
    public DbSet<ListingImage> ListingImages { get; set; } = null!;
    public DbSet<Amenity> Amenities { get; set; } = null!;
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
    public DbSet<Review> Reviews { get; set; } = null!;
    public DbSet<Booking> Bookings { get; set; } = null!;

    public AppDbContext(DbContextOptions<AppDbContext> options): base(options)
    {
        //Database.EnsureDeleted();
        //Database.EnsureCreated();
    }
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        var config = new ConfigurationBuilder()
                        .AddJsonFile("appsettings.json")
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .Build();
 
        optionsBuilder.UseNpgsql(config.GetConnectionString("DefaultConnection"));
    }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .ToTable("users");

        modelBuilder.Entity<RefreshToken>()
            .ToTable("refresh_tokens");

        modelBuilder.Entity<User>()
            .HasIndex(user => user.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasMany(user => user.RefreshTokens)
            .WithOne(token => token.User)
            .HasForeignKey(token => token.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RefreshToken>()
            .HasIndex(token => token.Token)
            .IsUnique();

        modelBuilder.Entity<RefreshToken>()
            .Property(token => token.IsRevoked)
            .HasDefaultValue(false);

        modelBuilder.Entity<Review>()
            .HasOne(review => review.Author)
            .WithMany(user => user.Reviews)
            .HasForeignKey(review => review.AuthorId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}