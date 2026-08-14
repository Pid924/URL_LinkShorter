using UrlShortener.Api.Dtos;

namespace UrlShortener.Api.Services;

public interface ILinkService
{
    Task<List<ShortLinkResponse>> GetAllAsync();
    Task<ShortLinkResponse> GetByIdAsync(int id);
    Task<ShortLinkResponse> CreateAsync(CreateShortLinkRequest request);
    Task<ShortLinkResponse> UpdateAsync(int id, UpdateShortLinkRequest request);
    Task DeleteAsync(int id);
    Task<ShortLinkResponse> SetEnabledAsync(int id, bool enabled);

    /// <summary>
    /// Resolves the destination URL for the given short code, choosing the platform-specific
    /// URL when one is configured and the visitor's platform matches.
    /// Increments TotalUsed and sets LastUsedDate on success.
    /// </summary>
    Task<string> ResolveAsync(string code, string? userAgent);
}
