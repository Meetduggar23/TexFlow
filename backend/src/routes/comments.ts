import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/project/:projectId', async (req: AuthRequest, res: Response) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { projectId: req.params.projectId },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        replies: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ comments });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, content, filePath, lineStart, lineEnd } = req.body;
    const comment = await prisma.comment.create({
      data: {
        projectId,
        userId: req.userId!,
        content,
        filePath,
        lineStart,
        lineEnd
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        replies: true
      }
    });
    res.json({ comment });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/reply', async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    const reply = await prisma.commentReply.create({
      data: {
        commentId: req.params.id,
        userId: req.userId!,
        content
      },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } }
    });
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/resolve', async (req: AuthRequest, res: Response) => {
  try {
    const comment = await prisma.comment.update({
      where: { id: req.params.id },
      data: { resolved: true }
    });
    res.json({ comment });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.comment.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
