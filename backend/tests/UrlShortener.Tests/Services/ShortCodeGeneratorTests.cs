using UrlShortener.Api.Services;
using Xunit;

namespace UrlShortener.Tests.Services;

public class ShortCodeGeneratorTests
{
    private readonly ShortCodeGenerator _sut = new();

    [Theory]
    [InlineData(4)]
    [InlineData(6)]
    [InlineData(10)]
    public void Generate_ReturnsCodeOfRequestedLength(int length)
    {
        var code = _sut.Generate(length);

        Assert.Equal(length, code.Length);
    }

    [Fact]
    public void Generate_OnlyContainsAlphanumericCharacters()
    {
        var code = _sut.Generate(20);

        Assert.All(code, c => Assert.True(char.IsLetterOrDigit(c)));
    }

    [Fact]
    public void Generate_ProducesDifferentCodesAcrossCalls()
    {
        var codes = Enumerable.Range(0, 50).Select(_ => _sut.Generate()).ToHashSet();

        Assert.True(codes.Count > 1, "Generator should not return the same code every time.");
    }

    [Theory]
    [InlineData(1)]
    [InlineData(3)]
    [InlineData(50)]
    public void Generate_WithLengthOutOfRange_ThrowsArgumentOutOfRangeException(int length)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => _sut.Generate(length));
    }
}
