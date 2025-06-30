import { db } from '../config/db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { comparePassword, generateToken } from './auth.utils';

export const login = async (req: any, res: any) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = generateToken({
    id: user.id,
    role: user.role,
    clubId: user.clubId ?? undefined,
  });

  res.json({ token });
};
