export type ResearchSnippet = { title: string; url: string; snippet: string };

export async function searchWeb(query: string): Promise<ResearchSnippet[]> {
  const apiKey = process.env.SEARCH_API_KEY;
  if (!apiKey) {
    return [];
  }

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: 5,
      include_answer: false,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Search API failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as {
    results?: Array<{ title?: string; url?: string; content?: string }>;
  };

  return (data.results ?? []).map((row) => ({
    title: row.title ?? "Source",
    url: row.url ?? "",
    snippet: (row.content ?? "").slice(0, 500),
  }));
}

export function buildResearchContext(snippets: ResearchSnippet[]): string {
  if (snippets.length === 0) {
    return "No live search results available. Use general knowledge but avoid specific unverifiable claims.";
  }
  return snippets
    .map((s, i) => `[${i + 1}] ${s.title}\nURL: ${s.url}\n${s.snippet}`)
    .join("\n\n");
}
