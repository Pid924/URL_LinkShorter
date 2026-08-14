using Microsoft.Extensions.Options;
using UrlShortener.Api.Dtos;
using UrlShortener.Api.Exceptions;
using UrlShortener.Api.Models;
using UrlShortener.Api.Options;
using UrlShortener.Api.Repositories;

namespace UrlShortener.Api.Services;

public class LinkService : ILinkService
{
    private readonly ILinkRepository _repository;
    private readonly IShortCodeGenerator _codeGenerator;
    private readonly IPlatformDetector _platformDetector;
    private readonly UrlShortenerOptions _options;

    public LinkService(
        ILinkRepository repository,
        IShortCodeGenerator codeGenerator,
        IPlatformDetector platformDetector,
        IOptions<UrlShortenerOptions> options)
    {
        _repository = repository;
        _codeGenerator = codeGenerator;
        _platformDetector = platformDetector;
        _options = options.Value;
    }

    public async Task<List<ShortLinkResponse>> GetAllAsync()
    {
        var links = await _repository.GetAllAsync();
        return links.Select(MapToResponse).ToList();
    }

    public async Task<ShortLinkResponse> GetByIdAsync(int id)
    {
        var entity = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException($"Link with id {id} was not found.");
        return MapToResponse(entity);
    }

    public async Task<ShortLinkResponse> CreateAsync(CreateShortLinkRequest request)
    {
        ValidateUrl(request.OriginalUrl, nameof(request.OriginalUrl));
        if (!string.IsNullOrWhiteSpace(request.IosUrl))
            ValidateUrl(request.IosUrl, nameof(request.IosUrl));
        if (!string.IsNullOrWhiteSpace(request.AndroidUrl))
            ValidateUrl(request.AndroidUrl, nameof(request.AndroidUrl));

        var code = string.IsNullOrWhiteSpace(request.CustomCode)
            ? await GenerateUniqueCodeAsync()
            : await ReserveCustomCodeAsync(request.CustomCode.Trim());

        var now = DateTime.UtcNow;

        var entity = new ShortLink
        {
            ShortCode = code,
            OriginalUrl = request.OriginalUrl,
            IosUrl = NullIfBlank(request.IosUrl),
            AndroidUrl = NullIfBlank(request.AndroidUrl),
            CreatedDate = now,
            ModifiedDate = now,
            LastUsedDate = null,
            TotalUsed = 0,
            IsEnabled = true
        };

        await _repository.AddAsync(entity);
        return MapToResponse(entity);
    }

    public async Task<ShortLinkResponse> UpdateAsync(int id, UpdateShortLinkRequest request)
    {
        var entity = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException($"Link with id {id} was not found.");

        if (!string.IsNullOrWhiteSpace(request.OriginalUrl))
        {
            ValidateUrl(request.OriginalUrl, nameof(request.OriginalUrl));
            entity.OriginalUrl = request.OriginalUrl;
        }

        if (request.ClearIosUrl)
        {
            entity.IosUrl = null;
        }
        else if (!string.IsNullOrWhiteSpace(request.IosUrl))
        {
            ValidateUrl(request.IosUrl, nameof(request.IosUrl));
            entity.IosUrl = request.IosUrl;
        }

        if (request.ClearAndroidUrl)
        {
            entity.AndroidUrl = null;
        }
        else if (!string.IsNullOrWhiteSpace(request.AndroidUrl))
        {
            ValidateUrl(request.AndroidUrl, nameof(request.AndroidUrl));
            entity.AndroidUrl = request.AndroidUrl;
        }

        if (request.IsEnabled.HasValue)
            entity.IsEnabled = request.IsEnabled.Value;

        entity.ModifiedDate = DateTime.UtcNow;

        await _repository.UpdateAsync(entity);
        return MapToResponse(entity);
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException($"Link with id {id} was not found.");
        await _repository.DeleteAsync(entity);
    }

    public async Task<ShortLinkResponse> SetEnabledAsync(int id, bool enabled)
    {
        var entity = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException($"Link with id {id} was not found.");

        entity.IsEnabled = enabled;
        entity.ModifiedDate = DateTime.UtcNow;

        await _repository.UpdateAsync(entity);
        return MapToResponse(entity);
    }

    public async Task<string> ResolveAsync(string code, string? userAgent)
    {
        var entity = await _repository.GetByCodeAsync(code)
            ?? throw new NotFoundException($"Short link '{code}' was not found.");

        if (!entity.IsEnabled)
            throw new ValidationException($"Short link '{code}' is currently disabled.");

        entity.TotalUsed += 1;
        entity.LastUsedDate = DateTime.UtcNow;

        await _repository.UpdateAsync(entity);

        // Pick the destination based on the visitor's platform, falling back to the default.
        var platform = _platformDetector.Detect(userAgent);

        return platform switch
        {
            VisitorPlatform.Ios     => entity.IosUrl ?? entity.OriginalUrl,
            VisitorPlatform.Android => entity.AndroidUrl ?? entity.OriginalUrl,
            _                       => entity.OriginalUrl
        };
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static void ValidateUrl(string url, string fieldName)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
        {
            throw new ValidationException($"'{url}' is not a valid absolute HTTP/HTTPS URL ({fieldName}).");
        }
    }

    private async Task<string> ReserveCustomCodeAsync(string code)
    {
        if (await _repository.ExistsByCodeAsync(code))
            throw new DuplicateCodeException(code);
        return code;
    }

    private async Task<string> GenerateUniqueCodeAsync()
    {
        for (var attempt = 0; attempt < _options.MaxGenerationAttempts; attempt++)
        {
            var candidate = _codeGenerator.Generate(_options.DefaultCodeLength);
            if (!await _repository.ExistsByCodeAsync(candidate))
                return candidate;
        }
        throw new ValidationException("Unable to generate a unique short code. Please try again.");
    }

    private ShortLinkResponse MapToResponse(ShortLink entity) => new()
    {
        Id = entity.Id,
        ShortCode = entity.ShortCode,
        ShortUrl = $"{_options.BaseUrl.TrimEnd('/')}/{entity.ShortCode}",
        OriginalUrl = entity.OriginalUrl,
        IosUrl = entity.IosUrl,
        AndroidUrl = entity.AndroidUrl,
        CreatedDate = entity.CreatedDate,
        ModifiedDate = entity.ModifiedDate,
        LastUsedDate = entity.LastUsedDate,
        TotalUsed = entity.TotalUsed,
        IsEnabled = entity.IsEnabled
    };

    private static string? NullIfBlank(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value;
}
