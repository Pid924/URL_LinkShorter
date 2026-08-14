using System.ComponentModel.DataAnnotations;

namespace UrlShortener.Api.Dtos;

public class UpdateShortLinkRequest
{
    /// <summary>New default destination URL. Omit to leave unchanged.</summary>
    [Url(ErrorMessage = "OriginalUrl must be a valid absolute URL.")]
    public string? OriginalUrl { get; set; }

    /// <summary>New iOS destination. Pass null to clear it. Omit the field entirely to leave unchanged.</summary>
    [Url(ErrorMessage = "IosUrl must be a valid absolute URL.")]
    public string? IosUrl { get; set; }

    /// <summary>New Android destination. Pass null to clear it. Omit the field entirely to leave unchanged.</summary>
    [Url(ErrorMessage = "AndroidUrl must be a valid absolute URL.")]
    public string? AndroidUrl { get; set; }

    /// <summary>Set to true to explicitly clear IosUrl.</summary>
    public bool ClearIosUrl { get; set; }

    /// <summary>Set to true to explicitly clear AndroidUrl.</summary>
    public bool ClearAndroidUrl { get; set; }

    /// <summary>Optionally toggle enabled state as part of the update.</summary>
    public bool? IsEnabled { get; set; }
}
