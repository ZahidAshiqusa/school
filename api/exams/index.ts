import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readJson, writeJson, handleCors, getTokenFromRequest } from '../lib/github.js';
import { verifyToken } from '../lib/auth.js';
import type { Exam } from '../../src/types/exam.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const token = getTokenFromRequest(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { data: exams, sha } = await readJson<Exam[]>('exams.json');

    if (req.method === 'GET') {
      return res.status(200).json(exams);
    }

    if (req.method === 'POST') {
      if (payload.role !== 'admin' && payload.role !== 'teacher') {
        return res.status(403).json({ error: 'Only admin/teacher can create exams' });
      }
      const exam: Exam = {
        ...req.body,
        createdBy: payload.userId,
        createdAt: new Date().toISOString(),
      };
      exams.push(exam);
      await writeJson('exams.json', exams, sha, `Add exam ${exam.id}`);
      return res.status(201).json(exam);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
