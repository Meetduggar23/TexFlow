import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';

const router = Router();
const execAsync = promisify(exec);

const STORAGE_PATH = process.env.STORAGE_PATH || './storage';

router.post('/:projectId', async (req: AuthRequest, res: Response) => {
  try {
    const { compiler } = req.body;
    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
      include: { files: true }
    });
    
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    const compilation = await prisma.compilation.create({
      data: {
        projectId: project.id,
        userId: req.userId!,
        compiler: compiler || project.compiler,
        status: 'running',
        startedAt: new Date()
      }
    });
    
    const workDir = path.join(STORAGE_PATH, 'compile', compilation.id);
    fs.mkdirSync(workDir, { recursive: true });
    
    for (const file of project.files) {
      const filePath = path.join(workDir, file.name);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, file.content, 'utf-8');
    }
    
    const engine = compiler || project.compiler;
    const timeout = parseInt(process.env.COMPILATION_TIMEOUT || '120');
    
    try {
      const cmd = engine === 'xelatex' 
        ? `xelatex -interaction=nonstopmode -halt-on-error main.tex`
        : engine === 'lualatex'
        ? `lualatex -interaction=nonstopmode -halt-on-error main.tex`
        : `pdflatex -interaction=nonstopmode -halt-on-error main.tex`;
      
      const { stdout, stderr } = await execAsync(cmd, {
        cwd: workDir,
        timeout: timeout * 1000,
        maxBuffer: 10 * 1024 * 1024
      });
      
      const logContent = stdout + '\n' + stderr;
      const pdfPath = path.join(workDir, 'main.pdf');
      
      let pdfUrl = null;
      if (fs.existsSync(pdfPath)) {
        const pdfDir = path.join(STORAGE_PATH, 'pdfs', project.id);
        fs.mkdirSync(pdfDir, { recursive: true });
        const destPdf = path.join(pdfDir, 'main.pdf');
        fs.copyFileSync(pdfPath, destPdf);
        pdfUrl = `/storage/pdfs/${project.id}/main.pdf`;
      }
      
      const hasError = logContent.includes('! ') || logContent.includes('Error');
      
      await prisma.compilation.update({
        where: { id: compilation.id },
        data: {
          status: hasError ? 'failed' : 'success',
          logs: logContent,
          pdfUrl,
          completedAt: new Date()
        }
      });
      
      res.json({
        compilationId: compilation.id,
        status: hasError ? 'failed' : 'success',
        logs: logContent,
        pdfUrl
      });
    } catch (error: any) {
      const logContent = error.stdout || '' + '\n' + (error.stderr || '');
      
      await prisma.compilation.update({
        where: { id: compilation.id },
        data: {
          status: 'failed',
          logs: logContent || error.message,
          completedAt: new Date()
        }
      });
      
      res.json({
        compilationId: compilation.id,
        status: 'failed',
        logs: logContent || error.message,
        pdfUrl: null
      });
    } finally {
      try {
        fs.rmSync(workDir, { recursive: true, force: true });
      } catch (e) {}
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:projectId', async (req: AuthRequest, res: Response) => {
  try {
    const compilations = await prisma.compilation.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json({ compilations });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
