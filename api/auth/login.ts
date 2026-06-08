import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readJson, handleCors, getTokenFromRequest } from '../_lib/github.ts';
import { createToken } from '../_lib/auth.ts';
import type { User } from '../../src/types/user.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Admin login via env
    if (role === 'admin') {
      const adminUser = process.env.ADMIN_USER;
      const adminPass = process.env.ADMIN_PASS;
      if (username === adminUser && password === adminPass) {
        const token = createToken({ userId: 'admin', role: 'admin', name: 'Admin' });
        return res.status(200).json({
          token,
          user: { id: 'admin', role: 'admin', name: 'Admin', phone: '', password: '' },
        });
      }
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Student/Teacher login via users.json
    const { data: users } = await readJson<User[]>('users.json');
    const user = users.find(
      (u) => u.id === username && u.password === password
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (role && user.role !== role) {
      return res.status(401).json({ error: 'Role mismatch' });
    }

    const token = createToken({ userId: user.id, role: user.role, name: user.name });
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json({ token, user: userWithoutPassword });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
