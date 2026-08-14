namespace UrlShortener.Api.Dtos;

public class ShortLinkResponse
{
    public int Id { get; set; }
    public string ShortCode { get; set; } = string.Empty;
    public string ShortUrl { get; set; } = string.Empty;
    public string OriginalUrl { get; set; } = string.Empty;
    public string? IosUrl { get; set; }
    public string? AndroidUrl { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime ModifiedDate { get; set; }
    public DateTime? LastUsedDate { get; set; }
    public int TotalUsed { get; set; }
    public bool IsEnabled { get; set; }
}
