import { Router, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AuthRequest, authenticate } from '../middleware/auth';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import fs from 'fs';
import path from 'path';

const router = Router();

function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  return authenticate(req, res, next);
}

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  compiler: z.enum(['pdflatex', 'xelatex', 'lualatex']).optional()
});

const defaultMainTex = `\\documentclass{article}

\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage{hyperref}

\\title{My Document}
\\author{Author}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}

Welcome to \\textbf{TexFlow}! This is your new LaTeX document.

\\section{Getting Started}

Start writing your document here. You can:

\\begin{itemize}
  \\item Write mathematical equations: $E = mc^2$
  \\item Insert figures and tables
  \\item Add citations and references
  \\item And much more!
\\end{itemize}

\\section{Conclusion}

Happy writing with TexFlow!

\\end{document}
`;

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.json({ projects: [] });
    }
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: req.userId },
          { members: { some: { userId: req.userId } } }
        ],
        deletedAt: null
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
        _count: { select: { files: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json({ projects });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, compiler } = createProjectSchema.parse(req.body);
    
    const project = await prisma.project.create({
      data: {
        name,
        description,
        compiler: compiler || 'pdflatex',
        ownerId: req.userId!,
        files: {
          create: {
            name: 'main.tex',
            path: '/main.tex',
            mimeType: 'application/x-tex',
            size: defaultMainTex.length,
            content: defaultMainTex
          }
        }
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
        files: true,
        _count: { select: { files: true } }
      }
    });
    
    await prisma.documentVersion.create({
      data: {
        projectId: project.id,
        userId: req.userId!,
        label: 'Initial version',
        snapshot: JSON.stringify({ files: project.files })
      }
    });
    
    res.json({ project });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
        files: { orderBy: { path: 'asc' } },
        folders: { orderBy: { path: 'asc' } },
        _count: { select: { files: true } }
      }
    });
    
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.deletedAt) return res.status(404).json({ error: 'Project not found' });
    
    if (req.userId) {
      const isOwner = project.ownerId === req.userId;
      const isMember = project.members.some(m => m.userId === req.userId);
      if (!isOwner && !isMember && !project.isPublic) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (!project.isPublic) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({ project });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.ownerId !== req.userId) return res.status(403).json({ error: 'Access denied' });
    
    const { name, description, compiler, isPublic, isFavorite } = req.body;
    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(compiler !== undefined && { compiler }),
        ...(isPublic !== undefined && { isPublic }),
        ...(isFavorite !== undefined && { isFavorite })
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
        _count: { select: { files: true } }
      }
    });
    res.json({ project: updated });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.ownerId !== req.userId) return res.status(403).json({ error: 'Access denied' });
    
    await prisma.project.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/restore', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.ownerId !== req.userId) return res.status(403).json({ error: 'Access denied' });
    
    await prisma.project.update({
      where: { id: req.params.id },
      data: { deletedAt: null }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id/history', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const versions = await prisma.documentVersion.findMany({
      where: { projectId: req.params.id },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json({ versions });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/versions', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { label } = req.body;
    const files = await prisma.file.findMany({ where: { projectId: req.params.id } });
    
    const version = await prisma.documentVersion.create({
      data: {
        projectId: req.params.id,
        userId: req.userId!,
        label: label || 'Manual save',
        snapshot: JSON.stringify({ files })
      }
    });
    
    res.json({ version });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/restore/:versionId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const version = await prisma.documentVersion.findUnique({
      where: { id: req.params.versionId }
    });
    if (!version) return res.status(404).json({ error: 'Version not found' });
    
    const snapshot = JSON.parse(version.snapshot);
    
    await prisma.file.deleteMany({ where: { projectId: req.params.id } });
    
    for (const file of snapshot.files) {
      await prisma.file.create({
        data: {
          projectId: req.params.id,
          name: file.name,
          path: file.path,
          mimeType: file.mimeType,
          size: file.size,
          content: file.content
        }
      });
    }
    
    const newVersion = await prisma.documentVersion.create({
      data: {
        projectId: req.params.id,
        userId: req.userId!,
        label: `Restored from ${version.label || 'version'}`,
        snapshot: JSON.stringify(snapshot)
      }
    });
    
    res.json({ success: true, version: newVersion });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id/download', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { files: true }
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    const archiver = require('archiver');
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    res.attachment(`${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.zip`);
    archive.pipe(res);
    
    for (const file of project.files) {
      archive.file(file.content, { name: file.name });
    }
    
    await archive.finalize();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
