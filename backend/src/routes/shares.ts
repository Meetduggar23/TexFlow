import { Router, Response, Request } from 'express';
import { prisma } from '../index';
import { AuthRequest, authenticate } from '../middleware/auth';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import { userCanAccessProject } from '../middleware/projectAccess';

const router = Router();
const roleSchema = z.enum(['viewer', 'commenter', 'editor']);
const inviteSchema = z.object({ email: z.string().email(), role: roleSchema });
const linkSchema = z.object({ role: roleSchema.optional().default('viewer') });

router.post('/project/:projectId/invite', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!(await userCanAccessProject(req.params.projectId, req.userId!, true))) return res.status(403).json({ error: 'Project access denied' });
    const { email, role } = inviteSchema.parse(req.body);
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
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/project/:projectId/link', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!(await userCanAccessProject(req.params.projectId, req.userId!, true))) return res.status(403).json({ error: 'Project access denied' });
    const { role } = linkSchema.parse(req.body);
    const link = await prisma.shareLink.create({
      data: {
        projectId: req.params.projectId,
        token: uuid(),
        role: role || 'viewer'
      }
    });
    res.json({ link });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/join/:token', async (req: Request, res: Response) => {
  try {
    const link = await prisma.shareLink.findUnique({
      where: { token: req.params.token },
      include: { 
        project: {
          include: {
            owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
            members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
            _count: { select: { files: true } }
          }
        }
      }
    });
    if (!link) return res.status(404).json({ error: 'Invalid link' });
    
    if (link.expiresAt && link.expiresAt < new Date()) {
      return res.status(410).json({ error: 'Link expired' });
    }
    
    // Only return project metadata, not file contents
    const projectMeta = link.project;
    res.json({ project: projectMeta, role: link.role });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/project/:projectId/members', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!(await userCanAccessProject(req.params.projectId, req.userId!, true))) return res.status(403).json({ error: 'Project access denied' });
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
    const project = await prisma.project.findUnique({ where: { id: req.params.projectId }, select: { ownerId: true } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const isOwner = project.ownerId === req.userId;
    const isSelf = req.params.userId === req.userId;
    if (!isOwner && !isSelf) return res.status(403).json({ error: 'Not authorized to remove this member' });
    
    await prisma.projectMember.deleteMany({
      where: { projectId: req.params.projectId, userId: req.params.userId }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
