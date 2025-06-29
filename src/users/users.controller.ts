import { db } from '../config/db';
import { users } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { hashPassword } from '../auth/auth.utils';
import { z } from 'zod';

// Create new clubadmin for a club
export const createUser = async (req: any, res: any) => {
  const { clubId } = req.params;
  const bodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() });
  }

  const { email, password } = parsed.data;
  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const hashed = await hashPassword(password);

  const [created] = await db.insert(users).values({
    email,
    passwordHash: hashed,
    role: 'clubadmin',
    clubId: Number(clubId),
  }).returning();

  res.status(201).json(created);
};

// Update user: password, role or club
export const updateUser = async (req: any, res: any) => {
  const { userId } = req.params;
  const bodySchema = z.object({
    password: z.string().min(6).optional(),
    role: z.enum(['superadmin', 'clubadmin']).optional(),
    clubId: z.number().optional(),
  });

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() });
  }

  const updateData: any = { ...parsed.data };
  if (updateData.password) {
    updateData.passwordHash = await hashPassword(updateData.password);
    delete updateData.password;
  }

  const [updated] = await db.update(users)
    .set(updateData)
    .where(eq(users.id, Number(userId)))
    .returning();

  if (!updated) return res.status(404).json({ error: 'User not found' });
  res.json(updated);
};

// Delete user (soft delete — set passwordHash = null)
export const deleteUser = async (req: any, res: any) => {
  const { userId } = req.params;

  const [deleted] = await db.update(users)
    .set({ passwordHash: undefined })
    .where(eq(users.id, Number(userId)))
    .returning();

  if (!deleted) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'User revoked', deleted });
};

// List all users (superadmin view)
export const listUsers = async (_req: any, res: any) => {
  const all = await db.select().from(users);
  res.json(all);
};
