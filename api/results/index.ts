import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readJson, writeJson, handleCors, getTokenFromRequest } from '../lib/github.js';
import { verifyToken } from '../lib/auth.js';
import type { Result } from '../../src/types/result.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const token = getTokenFromRequest(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { data: results, sha } = await readJson<Result[]>('results.json');

    if (req.method === 'GET') {
      const studentId = req.query.studentId as string | undefined;
      const examId = req.query.examId as string | undefined;
      let filtered = results;
      if (studentId) filtered = filtered.filter((r) => r.studentId === studentId);
      if (examId) filtered = filtered.filter((r) => r.examId === examId);
      // Students can only see their own results
      if (payload.role === 'student') {
        filtered = filtered.filter((r) => r.studentId === payload.userId);
      }
      return res.status(200).json(filtered);
    }

    if (req.method === 'POST') {
      const result: Result = {
        ...req.body,
        timestamp: new Date().toISOString(),
      };
      results.push(result);
      await writeJson('results.json', results, sha, `Add result for ${result.studentId}`);
      return res.status(201).json(result);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
