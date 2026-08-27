import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const router = Router();
const execAsync = promisify(exec);

const STORAGE_PATH = process.env.STORAGE_PATH || './storage';

function getLatexPath(): string {
  const miktexPath = path.join(
    process.env.LOCALAPPDATA || '',
    'Programs', 'MiKTeX', 'miktex', 'bin', 'x64'
  );
  const existingPath = process.env.PATH || '';
  return `${miktexPath};${existingPath}`;
}

function cleanAuxFiles(workDir: string) {
  const auxExtensions = ['.aux', '.log', '.out', '.toc', '.lof', '.lot', '.fls', '.fdb_latexmk', '.synctex.gz', '.nav', '.snm', '.vrb', '.bbl', '.blg', '.idx', '.ilg', '.ind', '.glg', '.glo', '.gls', '.ist', '.acn', '.acr', '.alg', '.xdy', '.dvi', '.ps', '.eps'];
  try {
    const files = fs.readdirSync(workDir);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      const name = path.basename(file, ext).toLowerCase();
      if (auxExtensions.includes(ext) || name === 'main.out') {
        fs.unlinkSync(path.join(workDir, file));
      }
    }
  } catch {}
}

router.get('/:projectId/pdf', async (req: AuthRequest, res: Response) => {
  try {
    const pdfPath = path.resolve(STORAGE_PATH, 'pdfs', req.params.projectId, 'main.pdf');
    if (!fs.existsSync(pdfPath)) return res.status(404).json({ error: 'PDF not found' });
    return res.sendFile(pdfPath);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:projectId', async (req: AuthRequest, res: Response) => {
  try {
    const { compiler, draft, syntaxCheck, errorHandling } = req.body;
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
      const filePath = path.join(workDir, file.path || file.name);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, file.content, 'utf-8');
    }
    
    const engine = compiler || project.compiler;
    const timeout = parseInt(process.env.COMPILATION_TIMEOUT || '120');
    
    try {
      let flags = '-interaction=nonstopmode';
      if (errorHandling === 'stop') {
        flags += ' -halt-on-error';
      }
      if (draft) {
        flags += ' -draftmode';
      }

      const cmd = engine === 'xelatex' 
        ? `xelatex ${flags} main.tex`
        : engine === 'lualatex'
        ? `lualatex ${flags} main.tex`
        : `pdflatex ${flags} main.tex`;
      
      const { stdout, stderr } = await execAsync(cmd, {
        cwd: workDir,
        timeout: timeout * 1000,
        maxBuffer: 10 * 1024 * 1024,
        env: { ...process.env, PATH: getLatexPath(), MIKTEX_ENABLE_UPDATE_CHECK: '0', MIKTEX_ENABLE_INSTALL: '1' }
      });
      
      const logContent = stdout + '\n' + stderr;
      const pdfPath = path.join(workDir, 'main.pdf');
      
      let pdfUrl = null;
      if (fs.existsSync(pdfPath) && !draft) {
        const pdfDir = path.join(STORAGE_PATH, 'pdfs', project.id);
        fs.mkdirSync(pdfDir, { recursive: true });
        const destPdf = path.join(pdfDir, 'main.pdf');
        fs.copyFileSync(pdfPath, destPdf);
        pdfUrl = `/api/compile/${project.id}/pdf`;
      }
      
      const cleanLog = logContent.replace(/pdflatex\s*:\s*pdflatex\s*:\s*major issue.*?\n/gi, '');
      const hasError = cleanLog.includes('! ') && !cleanLog.includes('Output written');
      const hasOutput = cleanLog.includes('Output written') || fs.existsSync(pdfPath);
      
      let status: string;
      if (hasError && !hasOutput) {
        status = 'failed';
      } else if (hasError && hasOutput) {
        status = 'success';
      } else {
        status = 'success';
      }
      
      await prisma.compilation.update({
        where: { id: compilation.id },
        data: {
          status,
          logs: cleanLog,
          pdfUrl,
          completedAt: new Date()
        }
      });
      
      res.json({
        compilationId: compilation.id,
        status,
        logs: cleanLog,
        pdfUrl
      });
    } catch (error: any) {
      const logContent = ((error.stdout || '') + '\n' + (error.stderr || '')).replace(/pdflatex\s*:\s*pdflatex\s*:\s*major issue.*?\n/gi, '');
      
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

router.post('/:projectId/clean', async (req: AuthRequest, res: Response) => {
  try {
    const { compiler, draft, syntaxCheck, errorHandling } = req.body;
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
      const filePath = path.join(workDir, file.path || file.name);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, file.content, 'utf-8');
    }
    
    const engine = compiler || project.compiler;
    const timeout = parseInt(process.env.COMPILATION_TIMEOUT || '120');
    
    try {
      let flags = '-interaction=nonstopmode';
      if (errorHandling === 'stop') {
        flags += ' -halt-on-error';
      }
      if (draft) {
        flags += ' -draftmode';
      }

      const cmd = engine === 'xelatex' 
        ? `xelatex ${flags} main.tex`
        : engine === 'lualatex'
        ? `lualatex ${flags} main.tex`
        : `pdflatex ${flags} main.tex`;
      
      const { stdout, stderr } = await execAsync(cmd, {
        cwd: workDir,
        timeout: timeout * 1000,
        maxBuffer: 10 * 1024 * 1024,
        env: { ...process.env, PATH: getLatexPath(), MIKTEX_ENABLE_UPDATE_CHECK: '0', MIKTEX_ENABLE_INSTALL: '1' }
      });
      
      const logContent = stdout + '\n' + stderr;
      const pdfPath = path.join(workDir, 'main.pdf');
      
      let pdfUrl = null;
      if (fs.existsSync(pdfPath) && !draft) {
        const pdfDir = path.join(STORAGE_PATH, 'pdfs', project.id);
        fs.mkdirSync(pdfDir, { recursive: true });
        const destPdf = path.join(pdfDir, 'main.pdf');
        fs.copyFileSync(pdfPath, destPdf);
        pdfUrl = `/api/compile/${project.id}/pdf`;
      }
      
      const cleanLog = logContent.replace(/pdflatex\s*:\s*pdflatex\s*:\s*major issue.*?\n/gi, '');
      const hasError = cleanLog.includes('! ') && !cleanLog.includes('Output written');
      const hasOutput = cleanLog.includes('Output written') || fs.existsSync(pdfPath);
      
      let status: string;
      if (hasError && !hasOutput) {
        status = 'failed';
      } else {
        status = 'success';
      }
      
      await prisma.compilation.update({
        where: { id: compilation.id },
        data: {
          status,
          logs: cleanLog,
          pdfUrl,
          completedAt: new Date()
        }
      });
      
      res.json({
        compilationId: compilation.id,
        status,
        logs: cleanLog,
        pdfUrl
      });
    } catch (error: any) {
      const logContent = ((error.stdout || '') + '\n' + (error.stderr || '')).replace(/pdflatex\s*:\s*pdflatex\s*:\s*major issue.*?\n/gi, '');
      
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
