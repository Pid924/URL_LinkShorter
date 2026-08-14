namespace UrlShortener.Api.Options;

public class UrlShortenerOptions
{
    public const string SectionName = "UrlShortener";

    public string BaseUrl { get; set; } = "https://localhost:5001";

    public int DefaultCodeLength { get; set; } = 6;

    public int MaxGenerationAttempts { get; set; } = 10;
}
