using Microsoft.Extensions.Options;
using Moq;
using UrlShortener.Api.Dtos;
using UrlShortener.Api.Exceptions;
using UrlShortener.Api.Models;
using UrlShortener.Api.Options;
using UrlShortener.Api.Repositories;
using UrlShortener.Api.Services;
using Xunit;

namespace UrlShortener.Tests.Services;

public class LinkServiceTests
{
    private readonly Mock<ILinkRepository> _repositoryMock = new();
    private readonly Mock<IShortCodeGenerator> _codeGeneratorMock = new();
    private readonly Mock<IPlatformDetector> _platformDetectorMock = new();
    private readonly LinkService _sut;

    public LinkServiceTests()
    {
        var options = Options.Create(new UrlShortenerOptions
        {
            BaseUrl = "https://short.test",
            DefaultCodeLength = 6,
            MaxGenerationAttempts = 5
        });

        _sut = new LinkService(
            _repositoryMock.Object,
            _codeGeneratorMock.Object,
            _platformDetectorMock.Object,
            options);
    }

    // ── Create ───────────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateAsync_WithCustomCode_CreatesLinkWithProvidedCode()
    {
        var request = new CreateShortLinkRequest { OriginalUrl = "https://example.com", CustomCode = "mycode" };

        _repositoryMock.Setup(r => r.ExistsByCodeAsync("mycode")).ReturnsAsync(false);
        _repositoryMock.Setup(r => r.AddAsync(It.IsAny<ShortLink>())).Returns(Task.CompletedTask);

        var result = await _sut.CreateAsync(request);

        Assert.Equal("mycode", result.ShortCode);
        Assert.Equal("https://example.com", result.OriginalUrl);
        Assert.Null(result.IosUrl);
        Assert.Null(result.AndroidUrl);
        Assert.Equal("https://short.test/mycode", result.ShortUrl);
        Assert.True(result.IsEnabled);
        Assert.Equal(0, result.TotalUsed);
    }

    [Fact]
    public async Task CreateAsync_WithPlatformUrls_StoresBothUrls()
    {
        var request = new CreateShortLinkRequest
        {
            OriginalUrl = "https://example.com",
            IosUrl = "https://apps.apple.com/app/example",
            AndroidUrl = "https://play.google.com/store/apps/example",
            CustomCode = "deeplink"
        };

        _repositoryMock.Setup(r => r.ExistsByCodeAsync("deeplink")).ReturnsAsync(false);
        _repositoryMock.Setup(r => r.AddAsync(It.IsAny<ShortLink>())).Returns(Task.CompletedTask);

        var result = await _sut.CreateAsync(request);

        Assert.Equal("https://apps.apple.com/app/example", result.IosUrl);
        Assert.Equal("https://play.google.com/store/apps/example", result.AndroidUrl);
    }

    [Fact]
    public async Task CreateAsync_WithDuplicateCustomCode_ThrowsDuplicateCodeException()
    {
        var request = new CreateShortLinkRequest { OriginalUrl = "https://example.com", CustomCode = "taken" };
        _repositoryMock.Setup(r => r.ExistsByCodeAsync("taken")).ReturnsAsync(true);

        await Assert.ThrowsAsync<DuplicateCodeException>(() => _sut.CreateAsync(request));
    }

    [Fact]
    public async Task CreateAsync_WithoutCustomCode_AutoGeneratesUniqueCode()
    {
        var request = new CreateShortLinkRequest { OriginalUrl = "https://example.com" };
        _codeGeneratorMock.SetupSequence(g => g.Generate(6)).Returns("aaa111").Returns("bbb222");
        _repositoryMock.SetupSequence(r => r.ExistsByCodeAsync(It.IsAny<string>()))
            .ReturnsAsync(true).ReturnsAsync(false);

        var result = await _sut.CreateAsync(request);

        Assert.Equal("bbb222", result.ShortCode);
    }

    [Fact]
    public async Task CreateAsync_ExceedsMaxGenerationAttempts_ThrowsValidationException()
    {
        var request = new CreateShortLinkRequest { OriginalUrl = "https://example.com" };
        _codeGeneratorMock.Setup(g => g.Generate(6)).Returns("dup");
        _repositoryMock.Setup(r => r.ExistsByCodeAsync(It.IsAny<string>())).ReturnsAsync(true);

        await Assert.ThrowsAsync<ValidationException>(() => _sut.CreateAsync(request));
    }

    [Theory]
    [InlineData("not-a-url")]
    [InlineData("ftp://example.com/file")]
    public async Task CreateAsync_WithInvalidUrl_ThrowsValidationException(string invalidUrl)
    {
        var request = new CreateShortLinkRequest { OriginalUrl = invalidUrl };

        await Assert.ThrowsAsync<ValidationException>(() => _sut.CreateAsync(request));
    }

    // ── GetById ──────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetByIdAsync_WhenNotFound_ThrowsNotFoundException()
    {
        _repositoryMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((ShortLink?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.GetByIdAsync(99));
    }

    // ── Update ───────────────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateAsync_UpdatesUrlAndBumpsModifiedDate()
    {
        var existing = BuildLink();
        _repositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existing);
        _repositoryMock.Setup(r => r.UpdateAsync(It.IsAny<ShortLink>())).Returns(Task.CompletedTask);

        var result = await _sut.UpdateAsync(1, new UpdateShortLinkRequest { OriginalUrl = "https://new.com" });

        Assert.Equal("https://new.com", result.OriginalUrl);
        Assert.True(result.ModifiedDate > existing.CreatedDate);
    }

    [Fact]
    public async Task UpdateAsync_ClearIosUrl_SetsIosUrlToNull()
    {
        var existing = BuildLink(iosUrl: "https://apps.apple.com/app/example");
        _repositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existing);
        _repositoryMock.Setup(r => r.UpdateAsync(It.IsAny<ShortLink>())).Returns(Task.CompletedTask);

        var result = await _sut.UpdateAsync(1, new UpdateShortLinkRequest { ClearIosUrl = true });

        Assert.Null(result.IosUrl);
    }

    [Fact]
    public async Task UpdateAsync_WhenNotFound_ThrowsNotFoundException()
    {
        _repositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync((ShortLink?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _sut.UpdateAsync(1, new UpdateShortLinkRequest { OriginalUrl = "https://new.com" }));
    }

    // ── Delete ───────────────────────────────────────────────────────────────

    [Fact]
    public async Task DeleteAsync_WhenFound_RemovesLink()
    {
        var existing = BuildLink();
        _repositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existing);
        _repositoryMock.Setup(r => r.DeleteAsync(existing)).Returns(Task.CompletedTask);

        await _sut.DeleteAsync(1);

        _repositoryMock.Verify(r => r.DeleteAsync(existing), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WhenNotFound_ThrowsNotFoundException()
    {
        _repositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync((ShortLink?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.DeleteAsync(1));
    }

    // ── Enable / disable ─────────────────────────────────────────────────────

    [Fact]
    public async Task SetEnabledAsync_DisablesLink()
    {
        var existing = BuildLink();
        _repositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existing);
        _repositoryMock.Setup(r => r.UpdateAsync(It.IsAny<ShortLink>())).Returns(Task.CompletedTask);

        var result = await _sut.SetEnabledAsync(1, false);

        Assert.False(result.IsEnabled);
    }

    // ── Resolve (platform-aware) ──────────────────────────────────────────────

    [Fact]
    public async Task ResolveAsync_DefaultPlatform_ReturnsOriginalUrl()
    {
        var existing = BuildLink(iosUrl: "https://apps.apple.com/app", androidUrl: "https://play.google.com/store/apps/x");
        _repositoryMock.Setup(r => r.GetByCodeAsync("code1")).ReturnsAsync(existing);
        _repositoryMock.Setup(r => r.UpdateAsync(It.IsAny<ShortLink>())).Returns(Task.CompletedTask);
        _platformDetectorMock.Setup(d => d.Detect(It.IsAny<string>())).Returns(VisitorPlatform.Default);

        var url = await _sut.ResolveAsync("code1", "Mozilla/5.0 (Windows NT 10.0)");

        Assert.Equal("https://example.com", url);
    }

    [Fact]
    public async Task ResolveAsync_IosPlatform_ReturnsIosUrl()
    {
        var existing = BuildLink(iosUrl: "https://apps.apple.com/app/example");
        _repositoryMock.Setup(r => r.GetByCodeAsync("code1")).ReturnsAsync(existing);
        _repositoryMock.Setup(r => r.UpdateAsync(It.IsAny<ShortLink>())).Returns(Task.CompletedTask);
        _platformDetectorMock.Setup(d => d.Detect(It.IsAny<string>())).Returns(VisitorPlatform.Ios);

        var url = await _sut.ResolveAsync("code1", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)");

        Assert.Equal("https://apps.apple.com/app/example", url);
    }

    [Fact]
    public async Task ResolveAsync_AndroidPlatform_ReturnsAndroidUrl()
    {
        var existing = BuildLink(androidUrl: "https://play.google.com/store/apps/example");
        _repositoryMock.Setup(r => r.GetByCodeAsync("code1")).ReturnsAsync(existing);
        _repositoryMock.Setup(r => r.UpdateAsync(It.IsAny<ShortLink>())).Returns(Task.CompletedTask);
        _platformDetectorMock.Setup(d => d.Detect(It.IsAny<string>())).Returns(VisitorPlatform.Android);

        var url = await _sut.ResolveAsync("code1", "Mozilla/5.0 (Linux; Android 14)");

        Assert.Equal("https://play.google.com/store/apps/example", url);
    }

    [Fact]
    public async Task ResolveAsync_IosPlatform_FallsBackToOriginalUrlWhenNoIosUrl()
    {
        var existing = BuildLink(); // no IosUrl
        _repositoryMock.Setup(r => r.GetByCodeAsync("code1")).ReturnsAsync(existing);
        _repositoryMock.Setup(r => r.UpdateAsync(It.IsAny<ShortLink>())).Returns(Task.CompletedTask);
        _platformDetectorMock.Setup(d => d.Detect(It.IsAny<string>())).Returns(VisitorPlatform.Ios);

        var url = await _sut.ResolveAsync("code1", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)");

        Assert.Equal("https://example.com", url);
    }

    [Fact]
    public async Task ResolveAsync_IncrementsUsageAndSetsLastUsedDate()
    {
        var existing = BuildLink();
        _repositoryMock.Setup(r => r.GetByCodeAsync("code1")).ReturnsAsync(existing);
        _repositoryMock.Setup(r => r.UpdateAsync(It.IsAny<ShortLink>())).Returns(Task.CompletedTask);
        _platformDetectorMock.Setup(d => d.Detect(It.IsAny<string>())).Returns(VisitorPlatform.Default);

        await _sut.ResolveAsync("code1", null);

        Assert.Equal(1, existing.TotalUsed);
        Assert.NotNull(existing.LastUsedDate);
    }

    [Fact]
    public async Task ResolveAsync_WhenDisabled_ThrowsValidationException()
    {
        var existing = BuildLink(isEnabled: false);
        _repositoryMock.Setup(r => r.GetByCodeAsync("code1")).ReturnsAsync(existing);

        await Assert.ThrowsAsync<ValidationException>(() => _sut.ResolveAsync("code1", null));
        _repositoryMock.Verify(r => r.UpdateAsync(It.IsAny<ShortLink>()), Times.Never);
    }

    [Fact]
    public async Task ResolveAsync_WhenNotFound_ThrowsNotFoundException()
    {
        _repositoryMock.Setup(r => r.GetByCodeAsync("missing")).ReturnsAsync((ShortLink?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.ResolveAsync("missing", null));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static ShortLink BuildLink(
        string? iosUrl = null,
        string? androidUrl = null,
        bool isEnabled = true) => new()
    {
        Id = 1,
        ShortCode = "code1",
        OriginalUrl = "https://example.com",
        IosUrl = iosUrl,
        AndroidUrl = androidUrl,
        CreatedDate = DateTime.UtcNow.AddDays(-1),
        ModifiedDate = DateTime.UtcNow.AddDays(-1),
        IsEnabled = isEnabled
    };
}
