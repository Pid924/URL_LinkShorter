# URL Shortener API

A .NET 8 Web API for creating, managing, and resolving shortened URLs, built with a layered
Repository → Service → Controller architecture on top of EF Core (InMemory provider).

## Features

- Create links **manually** (custom code) or **auto-generated** (random 6-char code)
- Update the destination URL and enabled state
- Delete links
- Enable / disable links (disabled links return 400 on redirect instead of resolving)
- Every link tracks: `CreatedDate`, `ModifiedDate`, `LastUsedDate`, `TotalUsed`
- List all links: `GET /api/links`
- Redirect + usage tracking: `GET /{code}`
- Swagger UI in Development
- xUnit + Moq unit tests for the service layer

## Project layout

```
UrlShortener.sln
src/UrlShortener.Api/
  Controllers/       LinksController (CRUD/enable/disable), RedirectController (GET /{code})
  Models/             ShortLink entity
  Dtos/               Create/Update request DTOs, response DTO
  Data/               AppDbContext (EF Core)
  Repositories/       ILinkRepository / LinkRepository (EF Core InMemory provider)
  Services/           ILinkService / LinkService (business logic), IShortCodeGenerator
  Exceptions/         NotFoundException, DuplicateCodeException, ValidationException
  Middleware/         ExceptionHandlingMiddleware (maps exceptions -> HTTP status codes)
  Options/            UrlShortenerOptions (BaseUrl, code length, generation retries)
tests/UrlShortener.Tests/
  Services/           LinkServiceTests, ShortCodeGeneratorTests
```

## Prerequisites

- .NET 8 SDK only. Data is stored in an EF Core **InMemory** database — no SQL Server, no
  migrations, nothing to install or configure. It resets every time the API restarts, which is
  fine for local dev/demos; swap `UseInMemoryDatabase` for `UseSqlServer` (or another provider) in
  `Program.cs` if you need data to persist.

## Setup

1. Run the API:

```bash
dotnet run --project src/UrlShortener.Api
```

2. `dotnet run` prints the actual listening URL(s), e.g.:
   ```
   Now listening on: https://localhost:5001
   Now listening on: http://localhost:5000
   ```
   Open Swagger at **exactly** that address + `/swagger` (e.g. `https://localhost:5001/swagger`). The
   included `launchSettings.json` also auto-opens the browser straight to `/swagger` when you run via
   `dotnet run` or an IDE. Root `/` has no route mapped (only `/api/links` and `/{code}` do), so visiting
   it directly will 404 — that's expected.

   If the browser says the page/connection can't be found at all (not a 404, but "can't reach this
   page"), it usually means nothing is listening on that port/protocol yet:
   - Confirm you're using the **exact host:port** printed in the console, and http vs https matches.
   - If using https and it's the first run, trust the local dev cert: `dotnet dev-certs https --trust`.

## Running tests

```bash
dotnet test
```

## API summary

| Method | Route                     | Description                                  |
|--------|----------------------------|-----------------------------------------------|
| GET    | `/api/links`               | List all links                                |
| GET    | `/api/links/{id}`          | Get one link                                  |
| POST   | `/api/links`                | Create a link (`CustomCode` optional)         |
| PUT    | `/api/links/{id}`          | Update `OriginalUrl` and/or `IsEnabled`       |
| DELETE | `/api/links/{id}`          | Delete a link                                 |
| PATCH  | `/api/links/{id}/enable`   | Enable a link                                 |
| PATCH  | `/api/links/{id}/disable`  | Disable a link                                |
| GET    | `/{code}`                   | Redirect to original URL, increments usage    |

### Create example

```http
POST /api/links
Content-Type: application/json

{
  "originalUrl": "https://example.com/some/very/long/path",
  "customCode": "promo2026"   // omit this field to auto-generate a code
}
```

Response:

```json
{
  "id": 1,
  "shortCode": "promo2026",
  "shortUrl": "https://localhost:5001/promo2026",
  "originalUrl": "https://example.com/some/very/long/path",
  "createdDate": "2026-08-13T10:00:00Z",
  "modifiedDate": "2026-08-13T10:00:00Z",
  "lastUsedDate": null,
  "totalUsed": 0,
  "isEnabled": true
}
```

## Connecting the Next.js frontend

This API is CORS-enabled for the companion `hook` Next.js app. By default it allows
`http://localhost:3000` — configurable via `Cors:AllowedOrigins` in `appsettings.json`:

```json
"Cors": {
  "AllowedOrigins": [ "http://localhost:3000" ]
}
```

Add every origin the frontend will actually be served from (add your deployed frontend URL too
once you have one). `UrlShortener:BaseUrl` should match this API's own public address — it's used
to build the `shortUrl` returned in every response, which the frontend uses for its copy and QR
code buttons.

For local dev, point the frontend's `NEXT_PUBLIC_API_BASE_URL` at this API's **HTTP** endpoint
(`http://localhost:5000`) rather than HTTPS — Node's server-side `fetch` doesn't trust the
ASP.NET Core self-signed dev certificate the way a browser does after `dotnet dev-certs https
--trust`, so HTTPS can fail on the frontend's server-rendered page even though it works fine from
the browser. See the `hook` project's README for details.

## Notes

- Data lives in memory only and resets every time the API process restarts — expected with the
  InMemory provider, not a bug. Swap in a real EF Core provider (`UseSqlServer`, `UseSqlite`, etc.)
  in `Program.cs` when you need persistence.
- `UrlShortener:BaseUrl` in `appsettings.json` controls the `shortUrl` value returned in
  responses — set it to your real public domain when you deploy.
- Manual codes must match `^[a-zA-Z0-9_-]{3,20}$`; duplicates return `409 Conflict`.
- All dates are stored/returned in UTC.
