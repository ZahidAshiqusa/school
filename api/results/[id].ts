import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readJson, writeJson, handleCors, getTokenFromRequest } from '../_lib/github.ts';
import { verifyToken } from '../_lib/auth.ts';
import type { Result } from '../../src/types/result.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const token = getTokenFromRequest(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  const resultId = req.query.id as string;
  if (!resultId) return res.status(400).json({ error: 'Result ID required' });

  try {
    const { data: results, sha } = await readJson<Result[]>('results.json');
    const idx = results.findIndex((r) => r.id === resultId);

    if (req.method === 'GET') {
      if (idx === -1) return res.status(404).json({ error: 'Result not found' });
      return res.status(200).json(results[idx]);
    }

    if (req.method === 'PUT') {
      // Teachers and admins can grade results
      if (payload.role !== 'admin' && payload.role !== 'teacher') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      if (idx === -1) return res.status(404).json({ error: 'Result not found' });
      const updates = req.body;
      results[idx] = { ...results[idx], ...updates, id: resultId };
      await writeJson('results.json', results, sha, `Grade result ${resultId}`);
      return res.status(200).json(results[idx]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
