using System.ComponentModel.DataAnnotations;

namespace UrlShortener.Api.Dtos;

public class CreateShortLinkRequest
{
    /// <summary>The default destination URL (used for desktop and any platform without a specific override).</summary>
    [Required]
    [Url(ErrorMessage = "OriginalUrl must be a valid absolute URL.")]
    public string OriginalUrl { get; set; } = string.Empty;

    /// <summary>Optional destination for iOS visitors. Falls back to OriginalUrl when omitted.</summary>
    [Url(ErrorMessage = "IosUrl must be a valid absolute URL.")]
    public string? IosUrl { get; set; }

    /// <summary>Optional destination for Android visitors. Falls back to OriginalUrl when omitted.</summary>
    [Url(ErrorMessage = "AndroidUrl must be a valid absolute URL.")]
    public string? AndroidUrl { get; set; }

    /// <summary>Optional manual short code. Leave empty to auto-generate one.</summary>
    [RegularExpression("^[a-zA-Z0-9_-]{3,20}$", ErrorMessage = "CustomCode must be 3-20 characters: letters, numbers, '-' or '_'.")]
    public string? CustomCode { get; set; }
}
