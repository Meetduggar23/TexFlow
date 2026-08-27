import { Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AuthRequest } from './auth';

export async function userCanAccessProject(projectId: string, userId: string, write = false) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, isPublic: true, members: { where: { userId }, select: { role: true } } },
  });
  if (!project) return false;
  if (project.ownerId === userId) return true;
  if (write) return project.members.some(member => member.role === 'editor');
  return project.isPublic || project.members.length > 0;
}

export async function requireProjectAccess(req: AuthRequest, res: Response, next: NextFunction) {
  const projectId = req.params.projectId || req.body?.projectId;
  if (!projectId || !req.userId || !(await userCanAccessProject(projectId, req.userId, req.method !== 'GET'))) {
    return res.status(403).json({ error: 'Project access denied' });
  }
  next();
}
