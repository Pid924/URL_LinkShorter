import { CreateLinkInput, ShortLink, UpdateLinkInput } from "./types";

// Same env var works server-side (in the page.tsx server component) and client-side
// (browser fetch calls), since Next.js inlines NEXT_PUBLIC_* vars for both.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:5000";

export class ApiRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parseOrThrow<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as T;
  }

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    // The API's exception middleware returns { status, error, message }.
    throw new ApiRequestError(body.message ?? body.title ?? "Something went wrong.", res.status);
  }

  return body as T;
}

export async function fetchLinks(): Promise<ShortLink[]> {
  const res = await fetch(`${API_BASE_URL}/api/links`, { cache: "no-store" });
  return parseOrThrow<ShortLink[]>(res);
}

export async function createLinkRequest(input: CreateLinkInput): Promise<ShortLink> {
  const res = await fetch(`${API_BASE_URL}/api/links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseOrThrow<ShortLink>(res);
}

// The API's PUT /api/links/{id} accepts originalUrl and/or isEnabled, so this one call
// covers both "edit URL" and "toggle enabled" from the UI.
export async function updateLinkRequest(id: number, input: UpdateLinkInput): Promise<ShortLink> {
  const res = await fetch(`${API_BASE_URL}/api/links/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseOrThrow<ShortLink>(res);
}

export async function deleteLinkRequest(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/links/${id}`, { method: "DELETE" });
  await parseOrThrow<void>(res);
}
