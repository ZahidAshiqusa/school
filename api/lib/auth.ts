import { createHmac } from 'crypto';

const SECRET = process.env.JWT_SECRET || 'study-hub-secret-key-change-in-production';

export interface TokenPayload {
  userId: string;
  role: string;
  name: string;
  exp: number;
}

export function createToken(payload: Omit<TokenPayload, 'exp'>): string {
  const exp = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  const data = JSON.stringify({ ...payload, exp });
  const encoded = Buffer.from(data).toString('base64');
  const signature = createHmac('sha256', SECRET).update(encoded).digest('hex');
  return `${encoded}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const [encoded, signature] = token.split('.');
    if (!encoded || !signature) return null;

    const expectedSig = createHmac('sha256', SECRET).update(encoded).digest('hex');
    if (signature !== expectedSig) return null;

    const payload: TokenPayload = JSON.parse(Buffer.from(encoded, 'base64').toString());

    if (payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}
