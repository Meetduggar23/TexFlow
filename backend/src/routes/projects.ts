import { Router, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AuthRequest, authenticate, optionalAuthenticate } from '../middleware/auth';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import unzipper from 'unzipper';
const archiver = require('archiver') as (type: string, options?: any) => import('archiver').Archiver;

const STORAGE_PATH = process.env.STORAGE_PATH || './storage';

const router = Router();
const zipUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

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

router.get('/', optionalAuthenticate, async (req: AuthRequest, res: Response) => {
  try {
    const showTrashed = req.query.trashed === 'true';
    const showArchived = req.query.archived === 'true';
    const where: any = {
      deletedAt: showTrashed ? { not: null } : null,
      isArchived: showArchived ? true : false,
    };
    
    if (req.userId) {
      where.OR = [
        { ownerId: req.userId },
        { members: { some: { userId: req.userId } } },
        { isPublic: true }
      ];
    } else {
      where.isPublic = true;
    }
    
    const projects = await prisma.project.findMany({
      where,
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

// Import a complete ZIP while preserving relative folders and binary assets.
router.post('/import/zip', requireAuth, zipUpload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'ZIP file is required' });
    const archive = await unzipper.Open.buffer(req.file.buffer);
    const entries = archive.files.filter(entry => entry.type === 'File');
    if (entries.length === 0) return res.status(400).json({ error: 'ZIP contains no files' });

    const safeEntries = entries.map(entry => {
      const relative = entry.path.replace(/\\/g, '/').replace(/^\/+/, '');
      if (!relative || relative.split('/').some(part => !part || part === '..' || /[<>:"|?*]/.test(part))) {
        throw new Error(`Unsafe ZIP path: ${entry.path}`);
      }
      return { entry, relative };
    });
    const rootTex = safeEntries.find(({ relative }) => /\.tex$/i.test(relative))?.relative;
    const projectName = String(req.body?.name || req.file.originalname.replace(/\.zip$/i, '')).trim() || 'Imported Project';
    const project = await prisma.project.create({
      data: {
        name: projectName,
        ownerId: req.userId!,
        compiler: 'pdflatex',
        files: { create: { name: '__placeholder__.txt', path: '/__placeholder__.txt', mimeType: 'text/plain', size: 0, content: '' } },
      },
      include: { files: true },
    });
    await prisma.file.deleteMany({ where: { projectId: project.id } });

    const folders = new Map<string, string>();
    for (const { relative } of safeEntries) {
      const parts = relative.split('/');
      let parentId: string | null = null;
      for (let i = 0; i < parts.length - 1; i++) {
        const folderPath = parts.slice(0, i + 1).join('/');
        if (!folders.has(folderPath)) {
          const folder = await prisma.folder.create({ data: { projectId: project.id, name: parts[i], parentId, path: `/${folderPath}` } });
          folders.set(folderPath, folder.id);
        }
        parentId = folders.get(folderPath)!;
      }
      const { entry } = safeEntries.find(item => item.relative === relative)!;
      const buffer = await entry.buffer();
      const name = parts[parts.length - 1];
      const mimeType = getImportMimeType(name);
      const content = /^(image\/|application\/pdf)/i.test(mimeType) ? buffer.toString('base64') : buffer.toString('utf8');
      await prisma.file.create({ data: { projectId: project.id, folderId: parentId, name, path: `/${relative}`, mimeType, size: buffer.length, content } });
    }
    const result = await prisma.project.findUnique({ where: { id: project.id }, include: { files: true, folders: true } });
    res.json({ project: result, rootFile: rootTex || null });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'ZIP import failed' });
  }
});

function getImportMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ({ tex: 'application/x-tex', latex: 'application/x-tex', sty: 'application/x-latex', cls: 'application/x-latex', bib: 'application/x-bibtex', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', pdf: 'application/pdf', md: 'text/markdown', txt: 'text/plain' } as Record<string, string>)[ext || ''] || 'application/octet-stream';
}

router.post('/trash/empty', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const trashedProjects = await prisma.project.findMany({
      where: {
        deletedAt: { not: null },
        OR: [
          { ownerId: req.userId },
          { members: { some: { userId: req.userId } } }
        ]
      },
      select: { id: true }
    });

    for (const p of trashedProjects) {
      try {
        const projectDir = path.join(STORAGE_PATH, 'projects', p.id);
        if (fs.existsSync(projectDir)) fs.rmSync(projectDir, { recursive: true, force: true });
      } catch {}
    }

    const ids = trashedProjects.map(p => p.id);
    if (ids.length > 0) {
      await prisma.documentVersion.deleteMany({ where: { projectId: { in: ids } } });
      await prisma.file.deleteMany({ where: { projectId: { in: ids } } });
      await prisma.folder.deleteMany({ where: { projectId: { in: ids } } });
      await prisma.project.deleteMany({ where: { id: { in: ids } } });
    }

    res.json({ success: true, deleted: ids.length });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/bulk/restore', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body as { ids: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No project IDs provided' });
    }
    const results: { id: string; renamed?: boolean; originalName?: string }[] = [];
    for (const id of ids) {
      const project = await prisma.project.findUnique({ where: { id } });
      if (!project || project.ownerId !== req.userId || !project.deletedAt) continue;
      const conflicting = await prisma.project.findFirst({
        where: {
          name: project.name, deletedAt: null, id: { not: id },
          OR: [{ ownerId: req.userId }, { members: { some: { userId: req.userId } } }]
        }, select: { id: true }
      });
      if (conflicting) {
        const restoredName = `${project.name} (Restored)`;
        await prisma.project.update({ where: { id }, data: { deletedAt: null, name: restoredName, isArchived: false } });
        results.push({ id, renamed: true, originalName: project.name });
      } else {
        await prisma.project.update({ where: { id }, data: { deletedAt: null, isArchived: false } });
        results.push({ id });
      }
    }
    res.json({ success: true, restored: results });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/bulk/permanent-delete', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body as { ids: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No project IDs provided' });
    }
    const projects = await prisma.project.findMany({
      where: { id: { in: ids }, ownerId: req.userId }
    });
    for (const p of projects) {
      try {
        const projectDir = path.join(STORAGE_PATH, 'projects', p.id);
        if (fs.existsSync(projectDir)) fs.rmSync(projectDir, { recursive: true, force: true });
      } catch {}
    }
    const projectIds = projects.map(p => p.id);
    if (projectIds.length > 0) {
      await prisma.documentVersion.deleteMany({ where: { projectId: { in: projectIds } } });
      await prisma.file.deleteMany({ where: { projectId: { in: projectIds } } });
      await prisma.folder.deleteMany({ where: { projectId: { in: projectIds } } });
      await prisma.project.deleteMany({ where: { id: { in: projectIds } } });
    }
    res.json({ success: true, deleted: projectIds.length });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', optionalAuthenticate, async (req: AuthRequest, res: Response) => {
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
    
    const { name, description, compiler, isPublic, isFavorite, isArchived } = req.body;
    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(compiler !== undefined && { compiler }),
        ...(isPublic !== undefined && { isPublic }),
        ...(isFavorite !== undefined && { isFavorite }),
        ...(isArchived !== undefined && { isArchived })
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

    const permanent = req.query.permanent === 'true';

    if (permanent) {
      // Permanent delete — remove files from disk and DB
      try {
        const projectDir = path.join(STORAGE_PATH, 'projects', req.params.id);
        if (fs.existsSync(projectDir)) fs.rmSync(projectDir, { recursive: true, force: true });
      } catch {}
      await prisma.documentVersion.deleteMany({ where: { projectId: req.params.id } });
      await prisma.file.deleteMany({ where: { projectId: req.params.id } });
      await prisma.project.delete({ where: { id: req.params.id } });
    } else {
      // Soft delete — move to trash
      await prisma.project.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date() }
      });
    }

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

router.post('/:id/archive', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.ownerId !== req.userId) return res.status(403).json({ error: 'Access denied' });
    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: { isArchived: !project.isArchived },
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
    const project = await prisma.project.findUnique({ where: { id: req.params.id }, select: { ownerId: true } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const isOwner = project.ownerId === req.userId;
    const member = await prisma.projectMember.findFirst({ where: { projectId: req.params.id, userId: req.userId, role: { in: ['owner', 'editor'] } } });
    if (!isOwner && !member) return res.status(403).json({ error: 'Not authorized to restore versions' });
    
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
    if (project.ownerId !== req.userId) return res.status(403).json({ error: 'Access denied' });
    
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
