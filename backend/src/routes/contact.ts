import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest, optionalAuthenticate } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().optional(),
  category: z.string().optional(),
  message: z.string().min(1),
});

router.post('/', optionalAuthenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, subject, category, message } = contactSchema.parse(req.body);
    
    // Store contact message in database
    await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        category,
        message,
        userId: req.userId || null,
      }
    });
    
    res.json({ success: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;