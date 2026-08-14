using System.Security.Cryptography;

namespace UrlShortener.Api.Services;

public interface IShortCodeGenerator
{
    string Generate(int length = 6);
}

public class ShortCodeGenerator : IShortCodeGenerator
{
    private const string Alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    public string Generate(int length = 6)
    {
        if (length < 4 || length > 32)
            throw new ArgumentOutOfRangeException(nameof(length), "Length must be between 4 and 32.");

        var buffer = new char[length];
        var bytes = RandomNumberGenerator.GetBytes(length);

        for (var i = 0; i < length; i++)
        {
            buffer[i] = Alphabet[bytes[i] % Alphabet.Length];
        }

        return new string(buffer);
    }
}
