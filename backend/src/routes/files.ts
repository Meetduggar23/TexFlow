import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { userCanAccessProject } from '../middleware/projectAccess';

const router = Router();

const createFileSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1),
  folderId: z.string().nullable().optional(),
  content: z.string().optional(),
  mimeType: z.string().optional()
});

router.get('/project/:projectId', async (req: AuthRequest, res: Response) => {
  try {
    if (!(await userCanAccessProject(req.params.projectId, req.userId!, false))) return res.status(403).json({ error: 'Project access denied' });
    const files = await prisma.file.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { path: 'asc' }
    });
    const folders = await prisma.folder.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { path: 'asc' }
    });
    res.json({ files, folders });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, name, folderId, content, mimeType } = createFileSchema.parse(req.body);
    if (!(await userCanAccessProject(projectId, req.userId!, true))) return res.status(403).json({ error: 'Project access denied' });
    
    const folder = folderId ? await prisma.folder.findUnique({ where: { id: folderId } }) : null;
    if (folder && folder.projectId !== projectId) return res.status(400).json({ error: 'Invalid folder' });
    if (!/^[^\\/:*?"<>|]+$/.test(name) || name === '.' || name === '..') return res.status(400).json({ error: 'Invalid file name' });
    const filePath = folder ? `${folder.path}/${name}` : `/${name}`;
    const duplicate = await prisma.file.findFirst({ where: { projectId, folderId: folderId || null, name } });
    if (duplicate) return res.status(409).json({ error: `${name} already exists` });
    
    const fileContent = content || '';
    const file = await prisma.file.create({
      data: {
        projectId,
        folderId,
        name,
        path: filePath,
        mimeType: mimeType || getMimeType(name),
        size: fileContent.length,
        content: fileContent
      }
    });
    
    await prisma.project.update({ where: { id: projectId }, data: { updatedAt: new Date() } });
    
    res.json({ file });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    if (!file) return res.status(404).json({ error: 'File not found' });
    if (!(await userCanAccessProject(file.projectId, req.userId!, false))) return res.status(403).json({ error: 'Project access denied' });
    res.json({ file });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { content, name } = req.body;
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    if (!file) return res.status(404).json({ error: 'File not found' });
    if (!(await userCanAccessProject(file.projectId, req.userId!, true))) return res.status(403).json({ error: 'Project access denied' });
    
    const updated = await prisma.file.update({
      where: { id: req.params.id },
      data: {
        ...(content !== undefined && { content, size: content.length }),
        ...(name !== undefined && { name })
      }
    });
    
    await prisma.project.update({ where: { id: file.projectId }, data: { updatedAt: new Date() } });
    
    res.json({ file: updated });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    if (!file) return res.status(404).json({ error: 'File not found' });
    if (!(await userCanAccessProject(file.projectId, req.userId!, true))) return res.status(403).json({ error: 'Project access denied' });
    
    await prisma.file.delete({ where: { id: req.params.id } });
    await prisma.project.update({ where: { id: file.projectId }, data: { updatedAt: new Date() } });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

const createFolderSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1),
  parentId: z.string().nullable().optional(),
});

router.post('/folders', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, name, parentId } = createFolderSchema.parse(req.body);
    if (!(await userCanAccessProject(projectId, req.userId!, true))) return res.status(403).json({ error: 'Project access denied' });
    
    const parent = parentId ? await prisma.folder.findUnique({ where: { id: parentId } }) : null;
    if (parentId && (!parent || parent.projectId !== projectId)) return res.status(400).json({ error: 'Invalid parent folder' });
    if (!/^[^\\/:*?"<>|]+$/.test(name) || name === '.' || name === '..') return res.status(400).json({ error: 'Invalid folder name' });
    const folderPath = parent ? `${parent.path}/${name}` : `/${name}`;
    const duplicate = await prisma.folder.findFirst({ where: { projectId, parentId: parentId || null, name } });
    if (duplicate) return res.status(409).json({ error: `${name} already exists` });
    
    const folder = await prisma.folder.create({
      data: { projectId, name, parentId: parentId || null, path: folderPath }
    });

    await prisma.project.update({ where: { id: projectId }, data: { updatedAt: new Date() } });
    
    res.json({ folder });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/folders/:id', async (req: AuthRequest, res: Response) => {
  try {
    const folder = await prisma.folder.findUnique({ where: { id: req.params.id } });
    if (!folder) return res.status(404).json({ error: 'Folder not found' });
    if (!(await userCanAccessProject(folder.projectId, req.userId!, true))) return res.status(403).json({ error: 'Project access denied' });
    const descendants: string[] = [];
    const collect = async (parentId: string) => {
      const children = await prisma.folder.findMany({ where: { parentId }, select: { id: true } });
      for (const child of children) { await collect(child.id); descendants.push(child.id); }
    };
    await collect(folder.id);
    await prisma.$transaction(async tx => {
      await tx.file.deleteMany({ where: { folderId: { in: [folder.id, ...descendants] } } });
      await tx.folder.deleteMany({ where: { id: { in: [...descendants, folder.id] } } });
      await tx.project.update({ where: { id: folder.projectId }, data: { updatedAt: new Date() } });
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    tex: 'application/x-tex',
    bib: 'application/x-bibtex',
    sty: 'application/x-latex',
    cls: 'application/x-latex',
    bst: 'application/x-bibtex',
    txt: 'text/plain',
    md: 'text/markdown',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    csv: 'text/csv'
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

export default router;
