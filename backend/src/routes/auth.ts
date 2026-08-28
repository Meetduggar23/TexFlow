import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index';
import { authenticate, AuthRequest, generateToken } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
const cookieOptions = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 };

const signupSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const profileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  avatarUrl: z.string().url().max(2048).nullable().optional(),
}).refine(value => value.name !== undefined || value.avatarUrl !== undefined, { message: 'At least one profile field is required' });

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
}).refine(value => value.currentPassword !== value.newPassword, { message: 'New password must be different' });

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, name, password } = signupSchema.parse(req.body);
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, name, passwordHash }
    });
    
    const token = generateToken(user.id);
    res.cookie('token', token, cookieOptions);
    res.json({ user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl }, token });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.deletedAt) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(user.id);
    res.cookie('token', token, cookieOptions);
    res.json({ user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl }, token });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token', cookieOptions);
  res.json({ success: true });
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, avatarUrl: true, role: true, createdAt: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, avatarUrl } = profileSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { ...(name !== undefined && { name }), ...(avatarUrl !== undefined && { avatarUrl }) },
      select: { id: true, email: true, name: true, avatarUrl: true }
    });
    res.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/password', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = passwordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
    
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.userId }, data: { passwordHash } });
    res.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { id: true, email: true } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    await prisma.user.update({ where: { id: user.id }, data: { deletedAt: new Date(), email: `deleted+${user.id}@invalid.local`, name: 'Deleted user', avatarUrl: null } });
    res.clearCookie('token', cookieOptions);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Unable to delete account' }); }
});

export default router;
