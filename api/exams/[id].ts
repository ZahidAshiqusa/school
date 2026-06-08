import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readJson, writeJson, handleCors, getTokenFromRequest } from '../_lib/github';
import { verifyToken } from '../_lib/auth';
import type { Exam } from '../../src/types/exam';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const token = getTokenFromRequest(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  const examId = req.query.id as string;
  if (!examId) return res.status(400).json({ error: 'Exam ID required' });

  try {
    const { data: exams, sha } = await readJson<Exam[]>('exams.json');
    const idx = exams.findIndex((e) => e.id === examId);

    if (req.method === 'GET') {
      if (idx === -1) return res.status(404).json({ error: 'Exam not found' });
      return res.status(200).json(exams[idx]);
    }

    if (req.method === 'PUT') {
      if (payload.role !== 'admin' && payload.role !== 'teacher') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      if (idx === -1) return res.status(404).json({ error: 'Exam not found' });
      exams[idx] = { ...exams[idx], ...req.body, id: examId };
      await writeJson('exams.json', exams, sha, `Update exam ${examId}`);
      return res.status(200).json(exams[idx]);
    }

    if (req.method === 'DELETE') {
      if (payload.role !== 'admin') return res.status(403).json({ error: 'Only admin can delete exams' });
      if (idx === -1) return res.status(404).json({ error: 'Exam not found' });
      exams.splice(idx, 1);
      await writeJson('exams.json', exams, sha, `Delete exam ${examId}`);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
