import { Dashboard } from "@/components/Dashboard";
import { fetchLinks } from "@/lib/api-client";
import { ShortLink } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Turns a server-side fetch failure into a message that names the actual cause.
 * The most common one in local dev is Node rejecting the ASP.NET Core self-signed
 * dev certificate — `dotnet dev-certs https --trust` installs it into the OS/browser
 * trust store, which Node does not read. So the browser and Postman work while this
 * server-rendered fetch fails.
 */
function describeFetchError(err: unknown): string {
  const code =
    (err as { cause?: { code?: string } })?.cause?.code ??
    (err as { code?: string })?.code;

  const tlsCodes = [
    "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
    "SELF_SIGNED_CERT_IN_CHAIN",
    "DEPTH_ZERO_SELF_SIGNED_CERT",
    "ERR_TLS_CERT_ALTNAME_INVALID",
    "CERT_HAS_EXPIRED",
  ];

  if (code && tlsCodes.includes(code)) {
    return `Node rejected the API's TLS certificate (${code}). Trusting the dev cert via 'dotnet dev-certs https --trust' only covers your OS/browser, not Node. Point NEXT_PUBLIC_API_BASE_URL at the HTTP endpoint (http://localhost:5000), or set NODE_TLS_REJECT_UNAUTHORIZED=0 in .env.local for local dev.`;
  }

  if (code === "ECONNREFUSED") {
    return "Connection refused — nothing is listening at that address. Check the API is running and that the port and protocol match what 'dotnet run' printed.";
  }

  if (code === "ENOTFOUND") {
    return "Host not found. Check NEXT_PUBLIC_API_BASE_URL for a typo.";
  }

  return "Couldn't reach the API. Check that it's running and that NEXT_PUBLIC_API_BASE_URL matches the address 'dotnet run' printed.";
}

export default async function HomePage() {
  let links: ShortLink[] = [];
  let initialError: string | null = null;

  try {
    links = await fetchLinks();
  } catch (err) {
    initialError = describeFetchError(err);
    // Full error goes to the terminal so the underlying cause is never hidden.
    console.error("[hook] Initial API fetch failed:", err);
  }

  return <Dashboard initialLinks={links} initialError={initialError} />;
}
