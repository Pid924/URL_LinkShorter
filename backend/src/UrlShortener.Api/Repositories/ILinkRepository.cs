using UrlShortener.Api.Models;

namespace UrlShortener.Api.Repositories;

public interface ILinkRepository
{
    Task<List<ShortLink>> GetAllAsync();
    Task<ShortLink?> GetByIdAsync(int id);
    Task<ShortLink?> GetByCodeAsync(string code);
    Task<bool> ExistsByCodeAsync(string code);
    Task AddAsync(ShortLink link);
    Task UpdateAsync(ShortLink link);
    Task DeleteAsync(ShortLink link);
}
