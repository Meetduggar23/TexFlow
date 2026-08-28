import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/notifications', async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/notifications/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    const notification = await prisma.notification.findUnique({ where: { id: req.params.id }, select: { userId: true } });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    if (notification.userId !== req.userId) return res.status(403).json({ error: 'Not authorized' });
    
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/notifications/read-all', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId! },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
