using Microsoft.EntityFrameworkCore;
using UrlShortener.Api.Models;

namespace UrlShortener.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<ShortLink> ShortLinks => Set<ShortLink>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ShortLink>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.ShortCode)
                .IsRequired()
                .HasMaxLength(20);

            entity.HasIndex(e => e.ShortCode)
                .IsUnique();

            entity.Property(e => e.OriginalUrl)
                .IsRequired()
                .HasMaxLength(2048);

            entity.Property(e => e.IosUrl).HasMaxLength(2048);
            entity.Property(e => e.AndroidUrl).HasMaxLength(2048);

            entity.Property(e => e.CreatedDate).IsRequired();
            entity.Property(e => e.ModifiedDate).IsRequired();
        });

        base.OnModelCreating(modelBuilder);
    }
}
