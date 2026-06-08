import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readJson, writeJson, handleCors, getTokenFromRequest } from '../lib/github';
import { verifyToken } from '../lib/auth';
import type { User } from '../../src/types/user';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const token = getTokenFromRequest(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { data: users, sha } = await readJson<User[]>('users.json');

    if (req.method === 'GET') {
      // Filter by role if provided
      const roleFilter = req.query.role as string | undefined;
      const filtered = roleFilter ? users.filter((u) => u.role === roleFilter) : users;
      const sanitized = filtered.map(({ password, ...rest }) => rest);
      return res.status(200).json(sanitized);
    }

    if (req.method === 'POST') {
      if (payload.role !== 'admin') return res.status(403).json({ error: 'Only admin can create users' });
      const { id, role, name, phone, password } = req.body;
      if (!id || !role || !name) return res.status(400).json({ error: 'id, role, name required' });
      if (users.find((u) => u.id === id)) return res.status(409).json({ error: 'User ID already exists' });
      const newUser: User = { id, role, name, phone: phone || '', password: password || '1234' };
      users.push(newUser);
      await writeJson('users.json', users, sha, `Add user ${id}`);
      const { password: _, ...created } = newUser;
      return res.status(201).json(created);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
