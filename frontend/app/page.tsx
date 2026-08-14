import { Dashboard } from "@/components/Dashboard";
import { fetchLinks } from "@/lib/api-client";
import { ShortLink } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let links: ShortLink[] = [];
  let initialError: string | null = null;

  try {
    links = await fetchLinks();
  } catch {
    initialError = "Couldn't reach the API. Make sure it's running and CORS is configured.";
  }

  return <Dashboard initialLinks={links} initialError={initialError} />;
}
