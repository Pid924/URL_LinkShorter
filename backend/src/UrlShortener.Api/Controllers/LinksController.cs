using Microsoft.AspNetCore.Mvc;
using UrlShortener.Api.Dtos;
using UrlShortener.Api.Services;

namespace UrlShortener.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class LinksController : ControllerBase
{
    private readonly ILinkService _linkService;

    public LinksController(ILinkService linkService)
    {
        _linkService = linkService;
    }

    /// <summary>Get all short links.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ShortLinkResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ShortLinkResponse>>> GetAll()
    {
        var links = await _linkService.GetAllAsync();
        return Ok(links);
    }

    /// <summary>Get a single short link by id.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ShortLinkResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ShortLinkResponse>> GetById(int id)
    {
        var link = await _linkService.GetByIdAsync(id);
        return Ok(link);
    }

    /// <summary>Create a new short link. Provide CustomCode for a manual code, or omit it to auto-generate one.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ShortLinkResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ShortLinkResponse>> Create([FromBody] CreateShortLinkRequest request)
    {
        var created = await _linkService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>Update the target URL and/or enabled state of a short link.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ShortLinkResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ShortLinkResponse>> Update(int id, [FromBody] UpdateShortLinkRequest request)
    {
        var updated = await _linkService.UpdateAsync(id, request);
        return Ok(updated);
    }

    /// <summary>Delete a short link.</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        await _linkService.DeleteAsync(id);
        return NoContent();
    }

    /// <summary>Enable a short link so it can be resolved again.</summary>
    [HttpPatch("{id:int}/enable")]
    [ProducesResponseType(typeof(ShortLinkResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ShortLinkResponse>> Enable(int id)
    {
        var link = await _linkService.SetEnabledAsync(id, true);
        return Ok(link);
    }

    /// <summary>Disable a short link so redirects stop working until re-enabled.</summary>
    [HttpPatch("{id:int}/disable")]
    [ProducesResponseType(typeof(ShortLinkResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ShortLinkResponse>> Disable(int id)
    {
        var link = await _linkService.SetEnabledAsync(id, false);
        return Ok(link);
    }
}
