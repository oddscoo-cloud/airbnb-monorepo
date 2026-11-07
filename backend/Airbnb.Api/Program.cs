using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Facebook;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Airbnb.Infrastructure.Services;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAutoMapper(cfg => {}, typeof(Program).Assembly, typeof(ListingProfile).Assembly);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Jwt:Key is not configured.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };

        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme =
                JwtBearerDefaults.AuthenticationScheme;

            options.DefaultChallengeScheme =
                JwtBearerDefaults.AuthenticationScheme;
        })
            
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
         {
            ValidateIssuerSigningKey = true,

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)),

            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],

            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],

            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
             };
          })

        .AddCookie("External", options =>
        {
            options.Cookie.Name = "Airbnb.External";
            options.Cookie.HttpOnly = true;
            options.Cookie.SameSite = SameSiteMode.None;
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            options.ExpireTimeSpan = TimeSpan.FromMinutes(5);
        })
        .AddFacebook(options =>
        {
            options.AppId =
                builder.Configuration["Authentication:Facebook:AppId"]
                ?? throw new InvalidOperationException(
                    "Facebook AppId is not configured.");

            options.AppSecret =
                builder.Configuration["Authentication:Facebook:AppSecret"]
                ?? throw new InvalidOperationException(
                    "Facebook AppSecret is not configured.");

            options.SignInScheme = "External";

            options.CallbackPath = "/signin-facebook";

            options.Scope.Add("email");
            options.Scope.Add("public_profile");

            options.Fields.Add("first_name");
            options.Fields.Add("last_name");
            options.Fields.Add("picture");

            options.ClaimActions.MapJsonKey(
                System.Security.Claims.ClaimTypes.GivenName,
                "first_name");

            options.ClaimActions.MapJsonKey(
                System.Security.Claims.ClaimTypes.Surname,
                "last_name");

            options.ClaimActions.MapJsonSubKey(
                "urn:facebook:picture",
                "picture",
                "data",
                "url");

            options.CorrelationCookie.SameSite = SameSiteMode.None;
            options.CorrelationCookie.SecurePolicy =
                CookieSecurePolicy.Always;
        });
            });

builder.Services.AddAuthorization();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ListingQuestionEmailSender>();
builder.Services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(); 

    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
            var context = services.GetRequiredService<AppDbContext>();

            context.Database.Migrate();
            
            UserSeeder.Initialize(context);
            AmenitiesSeeder.Initialize(context);
            await AdminSeeder.Initialize(
                context,
                services.GetRequiredService<IPasswordHasher<User>>(),
                builder.Configuration);
        }
        catch (Exception ex)
        {
            app.Logger.LogCritical(ex, "Database migration or development seeding failed.");
            throw;
        }
    }
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();