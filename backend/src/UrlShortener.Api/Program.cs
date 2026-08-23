using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using UrlShortener.Api.Data;
using UrlShortener.Api.Middleware;
using UrlShortener.Api.Options;
using UrlShortener.Api.Repositories;
using UrlShortener.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.Configure<UrlShortenerOptions>(
    builder.Configuration.GetSection(UrlShortenerOptions.SectionName));

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("UrlShortenerDb"));

builder.Services.AddScoped<ILinkRepository, LinkRepository>();
builder.Services.AddScoped<ILinkService, LinkService>();
builder.Services.AddSingleton<IShortCodeGenerator, ShortCodeGenerator>();
builder.Services.AddSingleton<IPlatformDetector, PlatformDetector>();

// Allows the Next.js frontend (running on a different origin/port) to call this API from the browser.
const string FrontendCorsPolicy = "FrontendCorsPolicy";
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "https://app-urlshortener-dfhpeqe3ede8c2e7.southeastasia-01.azurewebsites.net/" };

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "URL Shortener API",
        Version = "v1",
        Description = "A Web API for creating, managing, and resolving shortened URLs."
    });

    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

var app = builder.Build();

// Swagger is enabled in Development by default; remove the IsDevelopment check to expose it in other environments.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "URL Shortener API v1");
    });
}

app.UseHttpsRedirection();

// Must run before the exception middleware so CORS headers are still attached to error responses
// (otherwise the browser reports a CORS failure instead of the real 400/404/409).
app.UseCors(FrontendCorsPolicy);

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseAuthorization();
app.MapControllers();

app.Run();

// Exposed so integration tests can spin up the app via WebApplicationFactory<Program>.
public partial class Program
{
}
