namespace UrlShortener.Api.Exceptions;

/// <summary>Thrown when a requested link does not exist.</summary>
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message)
    {
    }
}

/// <summary>Thrown when a manually supplied short code is already taken.</summary>
public class DuplicateCodeException : Exception
{
    public DuplicateCodeException(string code) : base($"Short code '{code}' is already in use.")
    {
    }
}

/// <summary>Thrown for business-rule/input validation failures (invalid URL, disabled link, etc.).</summary>
public class ValidationException : Exception
{
    public ValidationException(string message) : base(message)
    {
    }
}
