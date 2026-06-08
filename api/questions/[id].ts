import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readJson, writeJson, handleCors, getTokenFromRequest } from '../lib/github';
import { verifyToken } from '../lib/auth';
import type { Question } from '../../src/types/question';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const token = getTokenFromRequest(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  const questionId = req.query.id as string;
  if (!questionId) return res.status(400).json({ error: 'Question ID required' });

  try {
    const { data: questions, sha } = await readJson<Question[]>('questions.json');
    const idx = questions.findIndex((q) => q.id === questionId);

    if (req.method === 'PUT') {
      if (payload.role !== 'admin' && payload.role !== 'teacher') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      if (idx === -1) return res.status(404).json({ error: 'Question not found' });
      questions[idx] = { ...questions[idx], ...req.body, id: questionId } as Question;
      await writeJson('questions.json', questions, sha, `Update question ${questionId}`);
      return res.status(200).json(questions[idx]);
    }

    if (req.method === 'DELETE') {
      if (payload.role !== 'admin' && payload.role !== 'teacher') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      if (idx === -1) return res.status(404).json({ error: 'Question not found' });
      questions.splice(idx, 1);
      await writeJson('questions.json', questions, sha, `Delete question ${questionId}`);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
