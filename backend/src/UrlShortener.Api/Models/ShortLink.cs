namespace UrlShortener.Api.Models;

public class ShortLink
{
    public int Id { get; set; }

    public string ShortCode { get; set; } = string.Empty;

    public string OriginalUrl { get; set; } = string.Empty;

    /// <summary>Optional URL for iOS visitors. Falls back to OriginalUrl when null.</summary>
    public string? IosUrl { get; set; }

    /// <summary>Optional URL for Android visitors. Falls back to OriginalUrl when null.</summary>
    public string? AndroidUrl { get; set; }

    public DateTime CreatedDate { get; set; }

    public DateTime ModifiedDate { get; set; }

    public DateTime? LastUsedDate { get; set; }

    public int TotalUsed { get; set; } = 0;

    public bool IsEnabled { get; set; } = true;
}
