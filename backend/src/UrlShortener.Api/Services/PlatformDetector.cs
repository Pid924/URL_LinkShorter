namespace UrlShortener.Api.Services;

public enum VisitorPlatform
{
    Default,
    Ios,
    Android
}

public interface IPlatformDetector
{
    VisitorPlatform Detect(string? userAgent);
}

public class PlatformDetector : IPlatformDetector
{
    // iOS: iPhone, iPad, iPod — checked before Android since some Android browsers
    // include "like Mac OS X" which could otherwise cause a false iOS match if we
    // were doing substring-only checks. Ordering matters here.
    private static readonly string[] IosSignals = ["iphone", "ipad", "ipod"];
    private static readonly string[] AndroidSignals = ["android"];

    public VisitorPlatform Detect(string? userAgent)
    {
        if (string.IsNullOrWhiteSpace(userAgent))
            return VisitorPlatform.Default;

        var ua = userAgent.ToLowerInvariant();

        if (IosSignals.Any(s => ua.Contains(s)))
            return VisitorPlatform.Ios;

        if (AndroidSignals.Any(s => ua.Contains(s)))
            return VisitorPlatform.Android;

        return VisitorPlatform.Default;
    }
}
