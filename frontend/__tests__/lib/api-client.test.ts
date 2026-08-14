import {
  fetchLinks,
  createLinkRequest,
  updateLinkRequest,
  deleteLinkRequest,
  ApiRequestError,
} from "@/lib/api-client";
import { ShortLink } from "@/lib/types";

const mockFetch = jest.fn();
beforeEach(() => {
  global.fetch = mockFetch;
  mockFetch.mockReset();
});

function makeLink(overrides: Partial<ShortLink> = {}): ShortLink {
  return {
    id: 1,
    shortCode: "abc123",
    shortUrl: "http://localhost:5000/abc123",
    originalUrl: "https://example.com",
    iosUrl: null,
    androidUrl: null,
    createdDate: "2026-08-14T00:00:00.000Z",
    modifiedDate: "2026-08-14T00:00:00.000Z",
    lastUsedDate: null,
    totalUsed: 0,
    isEnabled: true,
    ...overrides,
  };
}

function mockOk(body: unknown, status = 200) {
  mockFetch.mockResolvedValueOnce({ ok: true, status, json: async () => body });
}

function mockError(body: unknown, status: number) {
  mockFetch.mockResolvedValueOnce({ ok: false, status, json: async () => body });
}

function mockNoContent() {
  mockFetch.mockResolvedValueOnce({ ok: true, status: 204 });
}

// ── fetchLinks ────────────────────────────────────────────────────────────────

describe("fetchLinks", () => {
  it("calls GET /api/links and returns the array", async () => {
    const links = [makeLink(), makeLink({ id: 2, shortCode: "xyz789" })];
    mockOk(links);
    const result = await fetchLinks();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/links"),
      expect.objectContaining({ cache: "no-store" })
    );
    expect(result).toEqual(links);
  });

  it("throws ApiRequestError on a non-ok response", async () => {
    mockError({ message: "Server blew up" }, 500);
    const err = await fetchLinks().catch((e) => e);
    expect(err).toBeInstanceOf(ApiRequestError);
    expect(err.message).toBe("Server blew up");
  });

  it("uses 'Something went wrong.' when body has no message", async () => {
    mockError({}, 500);
    const err = await fetchLinks().catch((e) => e);
    expect(err).toBeInstanceOf(ApiRequestError);
    expect(err.message).toBe("Something went wrong.");
    expect(err.status).toBe(500);
  });

  it("falls back to body.title when message is absent", async () => {
    mockError({ title: "Bad Request" }, 400);
    await expect(fetchLinks()).rejects.toThrow("Bad Request");
  });
});

// ── createLinkRequest ─────────────────────────────────────────────────────────

describe("createLinkRequest", () => {
  it("calls POST /api/links with the correct body and returns the created link", async () => {
    const link = makeLink({ shortCode: "promo26" });
    mockOk(link, 201);
    const result = await createLinkRequest({ originalUrl: "https://example.com", customCode: "promo26" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/links"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl: "https://example.com", customCode: "promo26" }),
      })
    );
    expect(result).toEqual(link);
  });

  it("includes iosUrl and androidUrl when provided", async () => {
    mockOk(makeLink(), 201);
    await createLinkRequest({
      originalUrl: "https://example.com",
      iosUrl: "https://apps.apple.com/app/example",
      androidUrl: "https://play.google.com/store/apps/example",
    });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.iosUrl).toBe("https://apps.apple.com/app/example");
    expect(body.androidUrl).toBe("https://play.google.com/store/apps/example");
  });

  it("throws ApiRequestError with status 409 for a duplicate code", async () => {
    mockError({ message: "Short code 'promo26' is already in use." }, 409);
    const err = await createLinkRequest({ originalUrl: "https://x.com", customCode: "promo26" }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiRequestError);
    expect(err.status).toBe(409);
  });

  it("throws ApiRequestError with status 400 for an invalid URL", async () => {
    mockError({ message: "not-a-url is not valid." }, 400);
    const err = await createLinkRequest({ originalUrl: "not-a-url" }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiRequestError);
    expect(err.status).toBe(400);
  });
});

// ── updateLinkRequest ─────────────────────────────────────────────────────────

describe("updateLinkRequest", () => {
  it("calls PUT /api/links/:id with the correct body", async () => {
    const updated = makeLink({ originalUrl: "https://new.com", isEnabled: false });
    mockOk(updated);
    const result = await updateLinkRequest(1, { originalUrl: "https://new.com", isEnabled: false });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/links/1"),
      expect.objectContaining({ method: "PUT" })
    );
    expect(result).toEqual(updated);
  });

  it("sends clearIosUrl flag when provided", async () => {
    mockOk(makeLink());
    await updateLinkRequest(1, { clearIosUrl: true });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.clearIosUrl).toBe(true);
  });

  it("throws ApiRequestError with status 404 when link doesn't exist", async () => {
    mockError({ message: "Link with id 99 was not found." }, 404);
    const err = await updateLinkRequest(99, { isEnabled: true }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiRequestError);
    expect(err.status).toBe(404);
  });
});

// ── deleteLinkRequest ─────────────────────────────────────────────────────────

describe("deleteLinkRequest", () => {
  it("calls DELETE /api/links/:id and resolves void on 204", async () => {
    mockNoContent();
    await expect(deleteLinkRequest(1)).resolves.toBeUndefined();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/links/1"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("throws ApiRequestError with status 404 when link doesn't exist", async () => {
    mockError({ message: "Link with id 1 was not found." }, 404);
    const err = await deleteLinkRequest(1).catch((e) => e);
    expect(err).toBeInstanceOf(ApiRequestError);
    expect(err.status).toBe(404);
  });
});

// ── ApiRequestError ───────────────────────────────────────────────────────────

describe("ApiRequestError", () => {
  it("is an instance of Error", () => {
    expect(new ApiRequestError("oops", 500)).toBeInstanceOf(Error);
  });

  it("exposes status and message", () => {
    const err = new ApiRequestError("not found", 404);
    expect(err.message).toBe("not found");
    expect(err.status).toBe(404);
  });
});
