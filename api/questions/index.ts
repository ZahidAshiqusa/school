import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readJson, writeJson, handleCors, getTokenFromRequest } from '../_lib/github';
import { verifyToken } from '../_lib/auth';
import type { Question } from '../../src/types/question';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const token = getTokenFromRequest(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { data: questions, sha } = await readJson<Question[]>('questions.json');

    if (req.method === 'GET') {
      const examId = req.query.examId as string | undefined;
      const type = req.query.type as string | undefined;
      let filtered = questions;
      if (examId) filtered = filtered.filter((q) => q.examId === examId);
      if (type) filtered = filtered.filter((q) => q.type === type);
      return res.status(200).json(filtered);
    }

    if (req.method === 'POST') {
      if (payload.role !== 'admin' && payload.role !== 'teacher') {
        return res.status(403).json({ error: 'Only admin/teacher can add questions' });
      }
      const question: Question = req.body;
      questions.push(question);
      await writeJson('questions.json', questions, sha, `Add question ${question.id}`);
      return res.status(201).json(question);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
