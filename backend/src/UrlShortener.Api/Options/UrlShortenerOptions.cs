namespace UrlShortener.Api.Options;

public class UrlShortenerOptions
{
    public const string SectionName = "UrlShortener";

    public string BaseUrl { get; set; } = "https://app-urlshortener-dfhpeqe3ede8c2e7.southeastasia-01.azurewebsites.net/";

    public int DefaultCodeLength { get; set; } = 6;

    public int MaxGenerationAttempts { get; set; } = 10;
}
