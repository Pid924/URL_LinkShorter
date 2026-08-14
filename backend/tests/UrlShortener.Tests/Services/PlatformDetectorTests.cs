using UrlShortener.Api.Services;
using Xunit;

namespace UrlShortener.Tests.Services;

public class PlatformDetectorTests
{
    private readonly PlatformDetector _sut = new();

    [Theory]
    [InlineData("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15")]
    [InlineData("Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15")]
    [InlineData("Mozilla/5.0 (iPod touch; CPU iPhone OS 15_0 like Mac OS X)")]
    public void Detect_iOSUserAgents_ReturnsIos(string ua)
    {
        Assert.Equal(VisitorPlatform.Ios, _sut.Detect(ua));
    }

    [Theory]
    [InlineData("Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36")]
    [InlineData("Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36")]
    public void Detect_AndroidUserAgents_ReturnsAndroid(string ua)
    {
        Assert.Equal(VisitorPlatform.Android, _sut.Detect(ua));
    }

    [Theory]
    [InlineData("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")]
    [InlineData("Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) AppleWebKit/605.1.15")]
    [InlineData("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36")]
    public void Detect_DesktopUserAgents_ReturnsDefault(string ua)
    {
        Assert.Equal(VisitorPlatform.Default, _sut.Detect(ua));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Detect_NullOrWhitespace_ReturnsDefault(string? ua)
    {
        Assert.Equal(VisitorPlatform.Default, _sut.Detect(ua));
    }
}
