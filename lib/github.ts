import type { ProjectData } from "./schemas";

const API = "https://api.github.com";
export const GITHUB_USER = "Daniel-I24";

export interface RepoSummary {
  fullName: string;
  description: string;
  stars: number;
  updatedAt: string;
  /** True when the repo belongs to another account (Daniel is a collaborator). */
  collaboration: boolean;
}

interface RawRepo {
  full_name: string;
  name: string;
  owner: { login: string };
  description: string | null;
  stargazers_count: number;
  homepage: string | null;
  html_url: string;
  topics?: string[];
  created_at: string;
  updated_at: string;
  fork: boolean;
  private: boolean;
}

interface RawRelease {
  html_url: string;
  assets: { name: string; browser_download_url: string }[];
}

/** Server-only fetch: the token never reaches the browser (no NEXT_PUBLIC_ prefix). */
async function github<T>(path: string): Promise<T | null> {
  const token = process.env.GITHUB_TOKEN;
  const response = await fetch(`${API}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("GitHub request failed");
  return (await response.json()) as T;
}

/** "owner/name" from a full name or any github.com URL (…/tree/main, .git, etc.); null when invalid. */
export function parseRepo(input: string): string | null {
  const match = input.trim().match(/^(?:https?:\/\/(?:www\.)?github\.com\/)?([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:[/?#].*)?$/i);
  return match ? `${match[1]}/${match[2]}` : null;
}

const isCollaboration = (owner: string) => owner.toLowerCase() !== GITHUB_USER.toLowerCase();

const toSummary = (repo: RawRepo): RepoSummary => ({
  fullName: repo.full_name,
  description: repo.description ?? "",
  stars: repo.stargazers_count,
  updatedAt: repo.updated_at,
  collaboration: isCollaboration(repo.owner.login),
});

/** Own public repos, plus (with a token) public repos where Daniel collaborates. Most recent first. */
export async function listRepos(): Promise<RepoSummary[]> {
  const own = (await github<RawRepo[]>(`/users/${GITHUB_USER}/repos?per_page=100&sort=updated`)) ?? [];
  const shared = process.env.GITHUB_TOKEN
    ? ((await github<RawRepo[]>("/user/repos?affiliation=collaborator,organization_member&per_page=100&sort=updated")) ?? [])
    : [];
  const unique = new Map([...own, ...shared].filter((r) => !r.fork && !r.private).map((r) => [r.full_name, r]));
  return [...unique.values()].map(toSummary).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

const prettify = (name: string) => name.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

/** "2026-1" / "2026-2" from an ISO date. */
const semesterOf = (iso: string) => {
  const date = new Date(iso);
  return `${date.getFullYear()}-${date.getMonth() < 6 ? 1 : 2}`;
};

/** Fields that can be prefilled (import) or refreshed (sync) from a repository URL or full name. */
export async function repoToProject(input: string): Promise<Partial<ProjectData> | null> {
  const fullName = parseRepo(input);
  if (!fullName) return null;
  const repo = await github<RawRepo>(`/repos/${fullName}`);
  if (!repo || repo.private) return null;
  const [languages, release] = await Promise.all([
    github<Record<string, number>>(`/repos/${fullName}/languages`),
    github<RawRelease>(`/repos/${fullName}/releases/latest`),
  ]);
  const topics = repo.topics ?? [];
  const apkUrl = release?.assets.find((asset) => asset.name.endsWith(".apk"))?.browser_download_url ?? "";
  const isGame = topics.some((topic) => /game|unity|godot/i.test(topic));
  return {
    title: prettify(repo.name),
    slug: repo.name.toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
    summary: repo.description ?? "",
    stack: [...new Set([...Object.keys(languages ?? {}), ...topics])],
    repoUrl: repo.html_url,
    liveUrl: repo.homepage ?? "",
    apkUrl,
    downloadUrl: !apkUrl && release?.assets.length ? release.html_url : "",
    kind: apkUrl ? "mobile" : isGame ? "game" : "web",
    collaboration: isCollaboration(repo.owner.login),
    githubRepo: repo.full_name,
    stars: repo.stargazers_count,
    period: semesterOf(repo.created_at),
    year: new Date(repo.created_at).getFullYear(),
  };
}
