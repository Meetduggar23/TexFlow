import { Router, Response, Request } from 'express';
import { prisma } from '../index';
import { AuthRequest, authenticate } from '../middleware/auth';
import { v4 as uuid } from 'uuid';

const router = Router();

router.post('/project/:projectId/invite', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { email, role } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const existing = await prisma.projectMember.findFirst({
      where: { projectId: req.params.projectId, userId: user.id }
    });
    
    if (existing) {
      await prisma.projectMember.update({
        where: { id: existing.id },
        data: { role }
      });
    } else {
      await prisma.projectMember.create({
        data: { projectId: req.params.projectId, userId: user.id, role }
      });
    }
    
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'project_shared',
        title: 'Project Shared',
        message: `You've been invited to collaborate on a project`,
        projectId: req.params.projectId
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/project/:projectId/link', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    const link = await prisma.shareLink.create({
      data: {
        projectId: req.params.projectId,
        token: uuid(),
        role: role || 'viewer'
      }
    });
    res.json({ link });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/join/:token', async (req: Request, res: Response) => {
  try {
    const link = await prisma.shareLink.findUnique({
      where: { token: req.params.token },
      include: { project: true }
    });
    if (!link) return res.status(404).json({ error: 'Invalid link' });
    
    if (link.expiresAt && link.expiresAt < new Date()) {
      return res.status(410).json({ error: 'Link expired' });
    }
    
    res.json({ project: link.project, role: link.role });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/project/:projectId/members', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const members = await prisma.projectMember.findMany({
      where: { projectId: req.params.projectId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } }
    });
    res.json({ members });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/project/:projectId/members/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.projectMember.deleteMany({
      where: { projectId: req.params.projectId, userId: req.params.userId }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
