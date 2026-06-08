import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readJson, writeJson, handleCors, getTokenFromRequest } from '../lib/github.js';
import { verifyToken } from '../lib/auth.js';
import type { User } from '../../src/types/user.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const token = getTokenFromRequest(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  const userId = req.query.id as string;
  if (!userId) return res.status(400).json({ error: 'User ID required' });

  try {
    const { data: users, sha } = await readJson<User[]>('users.json');
    const idx = users.findIndex((u) => u.id === userId);

    if (req.method === 'GET') {
      if (idx === -1) return res.status(404).json({ error: 'User not found' });
      const { password, ...user } = users[idx];
      return res.status(200).json(user);
    }

    if (req.method === 'PUT') {
      if (idx === -1) return res.status(404).json({ error: 'User not found' });
      // Users can update their own profile; admin can update anyone
      if (payload.role !== 'admin' && payload.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const updates = req.body;
      users[idx] = { ...users[idx], ...updates, id: userId };
      await writeJson('users.json', users, sha, `Update user ${userId}`);
      const { password, ...updated } = users[idx];
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      if (payload.role !== 'admin') return res.status(403).json({ error: 'Only admin can delete users' });
      if (idx === -1) return res.status(404).json({ error: 'User not found' });
      users.splice(idx, 1);
      await writeJson('users.json', users, sha, `Delete user ${userId}`);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
