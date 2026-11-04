import type { ProjectData } from "./schemas";

const API = "https://api.github.com";
export const GITHUB_USER = "Daniel-I24";

export interface RepoSummary {
  fullName: string;
  name: string;
  description: string;
  stars: number;
  updatedAt: string;
}

interface RawRepo {
  full_name: string;
  name: string;
  description: string | null;
  stargazers_count: number;
  homepage: string | null;
  html_url: string;
  topics?: string[];
  created_at: string;
  updated_at: string;
  fork: boolean;
}

interface RawRelease {
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

/** Public, non-fork repositories of the portfolio owner, most recently updated first. */
export async function listRepos(): Promise<RepoSummary[]> {
  const repos = (await github<RawRepo[]>(`/users/${GITHUB_USER}/repos?per_page=100&sort=updated`)) ?? [];
  return repos
    .filter((repo) => !repo.fork)
    .map((repo) => ({
      fullName: repo.full_name,
      name: repo.name,
      description: repo.description ?? "",
      stars: repo.stargazers_count,
      updatedAt: repo.updated_at,
    }));
}

const prettify = (name: string) =>
  name.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

/** URL of the first .apk asset in the latest release, or "" when there is none. */
async function latestApk(fullName: string): Promise<string> {
  const release = await github<RawRelease>(`/repos/${fullName}/releases/latest`);
  return release?.assets.find((asset) => asset.name.endsWith(".apk"))?.browser_download_url ?? "";
}

/** Fields that can be prefilled (import) or refreshed (sync) from a repository. */
export async function repoToProject(fullName: string): Promise<Partial<ProjectData> | null> {
  if (!/^[\w.-]+\/[\w.-]+$/.test(fullName)) return null;
  const repo = await github<RawRepo>(`/repos/${fullName}`);
  if (!repo) return null;
  const [languages, apkUrl] = await Promise.all([
    github<Record<string, number>>(`/repos/${fullName}/languages`),
    latestApk(fullName),
  ]);
  const stack = [...new Set([...Object.keys(languages ?? {}), ...(repo.topics ?? [])])];
  return {
    title: prettify(repo.name),
    summary: repo.description ?? "",
    stack,
    repoUrl: repo.html_url,
    liveUrl: repo.homepage ?? "",
    apkUrl,
    kind: apkUrl ? "mobile" : "web",
    githubRepo: repo.full_name,
    stars: repo.stargazers_count,
    year: new Date(repo.created_at).getFullYear(),
  };
}
