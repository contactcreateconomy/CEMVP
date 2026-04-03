/**
 * Route: /search?q=
 */
import { SearchPageClient } from "./search-page-client";

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

interface SearchPageProps {
  searchParams?: Promise<{ q?: string | string[] }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolved = await searchParams;
  const qRaw = firstSearchParam(resolved?.q) ?? "";
  const q = qRaw.trim();

  return <SearchPageClient q={q} />;
}
