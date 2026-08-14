# hook — URL shortener (Next.js frontend for the .NET API)

A responsive Next.js 14 (App Router + TypeScript) admin dashboard for creating, managing, and
tracking short links, backed by the companion **UrlShortener.Api** .NET 8 Web API.

This app has no server-side storage of its own — every read/write goes straight to the C# API.

## Features

- **Create** links manually (custom code) or **auto-generated** (via the API)
- **Update** the destination URL, **delete** links
- **Enable/disable** directly from the table with a toggle switch
- Table (desktop) / card list (mobile) showing `Created`, `Modified`, `Last used`, `Total used`
- **Copy to clipboard** and **QR code** (with PNG download) buttons per row
- Fully responsive: table collapses to cards below `md`, drawer becomes a full-height slide-over
- Graceful degradation: if the API is unreachable, the dashboard still loads with a clear error
  banner and a Retry button instead of crashing

Short-link redirects (`GET /{code}`) are served by the **API**, not this app — that's where the
click gets tracked (`totalUsed`, `lastUsedDate`), so there's a single source of truth.

## Setup

1. Start the API (see the `UrlShortener` .NET solution) — by default it listens on
   `http://localhost:5000` / `https://localhost:5001`.

2. In this project, copy the env example and point it at the API:

   ```bash
   cp .env.local.example .env.local
   ```

   `.env.local` defaults to `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000`. Use the **HTTP**
   endpoint for local dev — Node's server-side `fetch` (used for the initial page load) doesn't
   trust the ASP.NET Core self-signed dev cert the way a browser does after
   `dotnet dev-certs https --trust`, so `https://localhost:5001` can fail server-side even though
   it works fine from the browser. HTTP sidesteps that for local development; switch to a real
   HTTPS endpoint with a proper certificate in production.

3. On the API side, make sure `appsettings.json`'s `Cors:AllowedOrigins` includes this app's
   origin (`http://localhost:3000` by default) and `UrlShortener:BaseUrl` matches the API's own
   public address — that's what gets returned as each link's `shortUrl` for copy/QR.

4. Install and run:

   ```bash
   npm install
   npm run dev
   ```

   Open `http://localhost:3000`.

## How the connection works

- `lib/api-client.ts` is the single place that talks to the API — `fetchLinks`,
  `createLinkRequest`, `updateLinkRequest` (`PUT`, used for both URL edits and enable/disable
  toggles, since the API's `PUT /api/links/{id}` accepts either field), and `deleteLinkRequest`.
  All of it reads `NEXT_PUBLIC_API_BASE_URL`.
- `app/page.tsx` is a server component that calls `fetchLinks()` at
  request time (`export const dynamic = "force-dynamic"`) so the dashboard always opens with
  fresh data. If the fetch throws (API down), it passes an `initialError` down instead of crashing
  the page.
- `components/Dashboard.tsx` owns client-side state after that: optimistic updates for
  enable/disable and delete (rolled back with a toast if the API call fails), plus a `refresh()`
  used after create/edit and from the Retry button.
- Each link's `shortUrl` — used by the copy button and QR code — comes directly from the API
  response, since the API already knows its own public base URL.

## Project layout

```
app/
  page.tsx                 Server component: fetches from the API, renders <Dashboard>
  not-found.tsx             Generic 404 for this dashboard app
  layout.tsx, globals.css   Fonts, metadata, base styles
components/
  Dashboard.tsx              Client state, API calls, error banner
  Header.tsx, StatsBar.tsx   Top bar and summary stats
  LinksTable.tsx / LinkRow.tsx / LinkCard.tsx   Desktop table + mobile cards
  LinkDrawer.tsx             Create/edit slide-over panel
  QrCodeModal.tsx            QR code + PNG download
  CopyButton.tsx, EnabledToggle.tsx, EmptyState.tsx, Toast.tsx
lib/
  types.ts       ShortLink / CreateLinkInput / UpdateLinkInput — mirrors the API's DTOs
  api-client.ts   All fetch calls to the C# API
  format.ts       Relative/absolute date formatting
```

## Notes

- Manual codes must match `^[a-zA-Z0-9_-]{3,20}$`; duplicates surface as a `409` error inline in
  the create drawer.
- All dates come from the API in UTC (ISO strings) and are formatted in the browser's local
  timezone.
- Deploying frontend and API to different origins in production works the same way — just update
  `NEXT_PUBLIC_API_BASE_URL` and the API's `Cors:AllowedOrigins` accordingly.
