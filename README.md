# URL_LinkShorter
a service that turns long URLs into short links, tracks how often each link is accessed, and lets users manage their links.

# Design
1 BackEnd
1.1 Create API to create Link with OriginalUrl and ShortUrl (auto-generated or custom code), has created date, modified date, last used date, total used, 
supported Platform-specific destination e.g. iOS, Android, or a default .
1.2 Create API to update Link with OriginalUrl.
1.3 Create API to delete Link.
1.4 Create API to set enable or disable Link.
1.5 Create API to view all Links.

2 FrontEnd
2.1 Create a page to list all Links with OriginalUrl, ShortUrl, created date, modified date, last used date, total used, and enable/disable status.
2.2 add button around header to create new Link with OriginalUrl and optional (auto-generated or custom code), supported Platform-specific destination.
2.3 add button from list view to update Link with OriginalUrl, the links that supported Platform-specific destination.
2.4 add button from list view to delete Link.
2.5 add button from list view to set enable or disable Link.
2.6 add button from list view to copy ShortUrl to clipboard.
2.7 add button from list view to show QR code for ShortUrl.


## Tech Stack
Backend: C#, .NET 8, ASP.NET Core Web API, Entity Framework Core (InMemory provider), xUnit
Frontend: Next.js, React, TypeScript, Tailwind CSS, Jest Testing Library

## Clone Repository
git clone [https://github.com/Pid924/URL_LinkShorter.git](https://github.com/Pid924/URL_LinkShorter.git)
cd URL_LinkShorter

## Backend Setup
cd backend
dotnet restore
dotnet run

## Frontend Setup
cd frontend
npm install
Create a .env.local file in the frontend root and specify your backend API endpoint
NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev

## Backend Unit Tests (xUnit)
cd backend
dotnet test

## Frontend Unit Tests (Jest & React Testing Library)
cd frontend
npm test

