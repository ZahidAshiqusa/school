import type { VercelRequest, VercelResponse } from '@vercel/node';

const GITHUB_API = 'https://api.github.com';

function getEnv() {
  return {
    token: process.env.GITHUB_TOKEN!,
    owner: process.env.GITHUB_OWNER!,
    repo: process.env.GITHUB_REPO!,
  };
}

interface GitHubContent {
  content: string;
  sha: string;
  encoding: string;
}

export async function readJson<T>(path: string): Promise<{ data: T; sha: string }> {
  const { token, owner, repo } = getEnv();
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error reading ${path}: ${res.status} ${text}`);
  }

  const json = (await res.json()) as GitHubContent;
  const decoded = atob(json.content.replace(/\n/g, ''));
  const data = JSON.parse(decoded) as T;

  return { data, sha: json.sha };
}

export async function writeJson<T>(
  path: string,
  data: T,
  sha?: string,
  message?: string
): Promise<void> {
  const { token, owner, repo } = getEnv();
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`;

  const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    let currentSha = sha;
    if (!currentSha) {
      try {
        const existing = await readJson(path);
        currentSha = existing.sha;
      } catch {
        currentSha = undefined;
      }
    }

    const body: Record<string, string> = {
      message: message || `Update ${path}`,
      content,
    };
    if (currentSha) body.sha = currentSha;

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (res.ok) return;

    if (res.status === 409 && attempt < maxRetries - 1) {
      // Conflict - retry with fresh SHA
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      sha = undefined;
      continue;
    }

    const text = await res.text();
    throw new Error(`GitHub API error writing ${path}: ${res.status} ${text}`);
  }
}

export function corsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  corsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

export function getTokenFromRequest(req: VercelRequest): string | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.slice(7);
}
