using Microsoft.EntityFrameworkCore;
using UrlShortener.Api.Data;
using UrlShortener.Api.Models;

namespace UrlShortener.Api.Repositories;

public class LinkRepository : ILinkRepository
{
    private readonly AppDbContext _context;

    public LinkRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ShortLink>> GetAllAsync()
    {
        return await _context.ShortLinks
            .AsNoTracking()
            .OrderByDescending(l => l.CreatedDate)
            .ToListAsync();
    }

    public async Task<ShortLink?> GetByIdAsync(int id)
    {
        return await _context.ShortLinks.FindAsync(id);
    }

    public async Task<ShortLink?> GetByCodeAsync(string code)
    {
        return await _context.ShortLinks.FirstOrDefaultAsync(l => l.ShortCode == code);
    }

    public async Task<bool> ExistsByCodeAsync(string code)
    {
        return await _context.ShortLinks.AnyAsync(l => l.ShortCode == code);
    }

    public async Task AddAsync(ShortLink link)
    {
        _context.ShortLinks.Add(link);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(ShortLink link)
    {
        if (_context.Entry(link).State == EntityState.Detached)
        {
            _context.ShortLinks.Update(link);
        }

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(ShortLink link)
    {
        _context.ShortLinks.Remove(link);
        await _context.SaveChangesAsync();
    }
}
