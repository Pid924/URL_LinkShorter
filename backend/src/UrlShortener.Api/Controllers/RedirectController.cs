using Microsoft.AspNetCore.Mvc;
using UrlShortener.Api.Services;

namespace UrlShortener.Api.Controllers;

[ApiController]
public class RedirectController : ControllerBase
{
    private readonly ILinkService _linkService;

    public RedirectController(ILinkService linkService)
    {
        _linkService = linkService;
    }

    /// <summary>
    /// Redirects to the platform-appropriate destination URL for the given short code.
    /// iOS and Android visitors are sent to their respective URLs when configured;
    /// all other visitors (desktop, unknown) receive the default OriginalUrl.
    /// Increments TotalUsed and sets LastUsedDate on every successful redirect.
    /// </summary>
    [HttpGet("/{code}")]
    [ProducesResponseType(StatusCodes.Status302Found)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RedirectToOriginal(string code)
    {
        var userAgent = Request.Headers.UserAgent.ToString();
        var destination = await _linkService.ResolveAsync(code, userAgent);
        return Redirect(destination);
    }
}
