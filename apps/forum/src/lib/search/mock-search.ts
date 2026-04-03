import type { Post, User } from "@/types";

function needle(q: string): string {
  return q.trim().toLowerCase();
}

function includes(haystack: string, n: string): boolean {
  return haystack.toLowerCase().includes(n);
}

/** Posts where title, summary, or body contains the query (case-insensitive). */
export function searchMockPosts(posts: Post[], q: string): Post[] {
  const n = needle(q);
  if (!n) return [];
  return posts.filter(
    (p) => includes(p.title, n) || includes(p.summary, n) || includes(p.body, n),
  );
}

/** Users where name or handle contains the query (case-insensitive). */
export function searchMockUsers(users: User[], q: string): User[] {
  const n = needle(q);
  if (!n) return [];
  return users.filter((u) => includes(u.name, n) || includes(u.handle, n));
}
