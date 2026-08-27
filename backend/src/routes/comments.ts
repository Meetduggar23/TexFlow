import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { userCanAccessProject } from '../middleware/projectAccess';

const router = Router();
const commentSchema = z.object({
  projectId: z.string().min(1), content: z.string().trim().min(1).max(10000),
  filePath: z.string().max(1000).optional(), lineStart: z.number().int().positive().optional(), lineEnd: z.number().int().positive().optional(),
});
const replySchema = z.object({ content: z.string().trim().min(1).max(10000) });

router.get('/project/:projectId', async (req: AuthRequest, res: Response) => {
  try {
    if (!(await userCanAccessProject(req.params.projectId, req.userId!, false))) return res.status(403).json({ error: 'Project access denied' });
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
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, content, filePath, lineStart, lineEnd } = commentSchema.parse(req.body);
    if (!(await userCanAccessProject(projectId, req.userId!, true))) return res.status(403).json({ error: 'Project access denied' });
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
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/reply', async (req: AuthRequest, res: Response) => {
  try {
    const { content } = replySchema.parse(req.body);
    const parent = await prisma.comment.findUnique({ where: { id: req.params.id }, select: { projectId: true } });
    if (!parent || !(await userCanAccessProject(parent.projectId, req.userId!, true))) return res.status(403).json({ error: 'Project access denied' });
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
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/resolve', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.comment.findUnique({ where: { id: req.params.id }, select: { projectId: true } });
    if (!existing || !(await userCanAccessProject(existing.projectId, req.userId!, true))) return res.status(403).json({ error: 'Project access denied' });
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
    const existing = await prisma.comment.findUnique({ where: { id: req.params.id }, select: { projectId: true } });
    if (!existing || !(await userCanAccessProject(existing.projectId, req.userId!, true))) return res.status(403).json({ error: 'Project access denied' });
    await prisma.comment.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
