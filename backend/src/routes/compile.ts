import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';
import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';
import { userCanAccessProject } from '../middleware/projectAccess';

const router = Router();
const STORAGE_PATH = process.env.STORAGE_PATH || './storage';
const activeJobs = new Map<string, ChildProcess>();

function getLatexPath() {
  const miktexPath = path.join(process.env.LOCALAPPDATA || '', 'Programs', 'MiKTeX', 'miktex', 'bin', 'x64');
  return `${miktexPath};${process.env.PATH || ''}`;
}

function cleanAuxFiles(workDir: string) {
  const extensions = new Set(['.aux', '.log', '.out', '.toc', '.lof', '.lot', '.fls', '.fdb_latexmk', '.synctex.gz', '.nav', '.snm', '.vrb', '.bbl', '.blg', '.idx', '.ilg', '.ind', '.glg', '.glo', '.gls', '.ist', '.acn', '.acr', '.alg', '.xdy', '.dvi', '.ps', '.eps']);
  try {
    for (const file of fs.readdirSync(workDir)) {
      if (extensions.has(path.extname(file).toLowerCase())) fs.unlinkSync(path.join(workDir, file));
    }
  } catch { /* best effort cleanup */ }
}

type CompilerRun = Promise<{ stdout: string; stderr: string; cancelled: boolean }> & { child?: ChildProcess };
function runCompiler(command: string, args: string[], cwd: string, timeoutMs: number): CompilerRun {
  let childProcess: ChildProcess | undefined;
  const promise = new Promise<{ stdout: string; stderr: string; cancelled: boolean }>((resolve, reject) => {
    const child = childProcess = spawn(command, args, {
      cwd,
      env: { ...process.env, PATH: getLatexPath(), MIKTEX_ENABLE_UPDATE_CHECK: '0', MIKTEX_ENABLE_INSTALL: '1' },
      windowsHide: true,
    });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; child.kill(); }, timeoutMs);
    child.stdout.on('data', chunk => { stdout += chunk.toString(); });
    child.stderr.on('data', chunk => { stderr += chunk.toString(); });
    child.on('error', reject);
    child.on('close', code => {
      clearTimeout(timer);
      if (timedOut) reject(Object.assign(new Error('Compilation timed out'), { stdout, stderr }));
      else resolve({ stdout, stderr, cancelled: code === null });
    });
  }) as CompilerRun;
  promise.child = childProcess;
  return promise;
}

async function compile(req: AuthRequest, res: Response, clean: boolean) {
  const { compiler, draft, syntaxCheck, errorHandling, mainDocument, timeout: requestedTimeout } = req.body || {};
  const project = await prisma.project.findUnique({ where: { id: req.params.projectId }, include: { files: true } });
  if (!project) return res.status(404).json({ error: 'Project not found' });
  if (!(await userCanAccessProject(project.id, req.userId!, true))) return res.status(403).json({ error: 'Project access denied' });

  const compilation = await prisma.compilation.create({
    data: { projectId: project.id, userId: req.userId!, compiler: compiler || project.compiler, status: 'running', startedAt: new Date() },
  });
  const workDir = path.join(STORAGE_PATH, 'compile', compilation.id);
  fs.mkdirSync(workDir, { recursive: true });
  for (const file of project.files) {
    const filePath = path.join(workDir, file.path || file.name);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, file.content, 'utf8');
  }
  if (clean) cleanAuxFiles(workDir);

  const engine = compiler || project.compiler || 'pdflatex';
  const command = engine === 'xelatex' ? 'xelatex' : engine === 'lualatex' ? 'lualatex' : 'pdflatex';
  const documentName = typeof mainDocument === 'string' && /^[^\\/:*?"<>|]+\.tex$/i.test(mainDocument) ? mainDocument : 'main.tex';
  // Fast/draft mode keeps the PDF-producing compiler workflow intact. Draft is
  // metadata for the client; -draftmode would suppress the PDF entirely.
  const args = ['-interaction=nonstopmode', ...(syntaxCheck !== false ? ['-file-line-error'] : []), ...(errorHandling === 'stop' ? ['-halt-on-error'] : []), documentName];
  const timeout = Math.min(Math.max(Number(requestedTimeout) || parseInt(process.env.COMPILATION_TIMEOUT || '120', 10), 10), 300) * 1000;
  try {
    const running = runCompiler(command, args, workDir, timeout);
    if (running.child) activeJobs.set(compilation.id, running.child);
    const result = await running;
    activeJobs.delete(compilation.id);
    const logs = `${result.stdout}\n${result.stderr}`.replace(/pdflatex\s*:\s*pdflatex\s*:\s*major issue.*?\n/gi, '');
    if (result.cancelled) {
      await prisma.compilation.update({ where: { id: compilation.id }, data: { status: 'cancelled', logs, completedAt: new Date() } });
      return res.json({ compilationId: compilation.id, status: 'cancelled', logs, pdfUrl: null });
    }
    const pdfPath = path.join(workDir, `${path.basename(documentName, '.tex')}.pdf`);
    let pdfUrl: string | null = null;
    if (fs.existsSync(pdfPath)) {
      const pdfDir = path.join(STORAGE_PATH, 'pdfs', project.id);
      fs.mkdirSync(pdfDir, { recursive: true });
      fs.copyFileSync(pdfPath, path.join(pdfDir, 'main.pdf'));
      pdfUrl = `/api/compile/${project.id}/pdf`;
    }
    const hasError = /(^|\n)!\s/.test(logs) || /Emergency stop/i.test(logs);
    const status = hasError && !pdfUrl ? 'failed' : 'success';
    await prisma.compilation.update({ where: { id: compilation.id }, data: { status, logs, pdfUrl, completedAt: new Date() } });
    return res.json({ compilationId: compilation.id, status, logs, pdfUrl });
  } catch (error: any) {
    activeJobs.delete(compilation.id);
    const logs = `${error.stdout || ''}\n${error.stderr || ''}`.trim() || error.message || 'Compilation failed';
    await prisma.compilation.update({ where: { id: compilation.id }, data: { status: 'failed', logs, completedAt: new Date() } });
    return res.json({ compilationId: compilation.id, status: 'failed', logs, pdfUrl: null });
  } finally {
    try { fs.rmSync(workDir, { recursive: true, force: true }); } catch { /* best effort */ }
  }
}

router.get('/:projectId/pdf', async (req: AuthRequest, res: Response) => {
  if (!(await userCanAccessProject(req.params.projectId, req.userId!, false))) return res.status(403).json({ error: 'Project access denied' });
  const pdfPath = path.resolve(STORAGE_PATH, 'pdfs', req.params.projectId, 'main.pdf');
  return fs.existsSync(pdfPath) ? res.sendFile(pdfPath) : res.status(404).json({ error: 'PDF not found' });
});
router.post('/:projectId', (req, res) => compile(req as AuthRequest, res, false));
router.post('/:projectId/clean', (req, res) => compile(req as AuthRequest, res, true));
router.delete('/:projectId/running', async (req: AuthRequest, res: Response) => {
  if (!(await userCanAccessProject(req.params.projectId, req.userId!, true))) return res.status(403).json({ error: 'Project access denied' });
  const jobs = await prisma.compilation.findMany({ where: { projectId: req.params.projectId, status: 'running' } });
  for (const job of jobs) {
    activeJobs.get(job.id)?.kill();
    await prisma.compilation.update({ where: { id: job.id }, data: { status: 'cancelled', completedAt: new Date() } });
  }
  return res.json({ cancelled: jobs.length });
});
router.get('/:projectId', async (req: AuthRequest, res: Response) => {
  if (!(await userCanAccessProject(req.params.projectId, req.userId!, false))) return res.status(403).json({ error: 'Project access denied' });
  const compilations = await prisma.compilation.findMany({ where: { projectId: req.params.projectId }, orderBy: { createdAt: 'desc' }, take: 20 });
  return res.json({ compilations });
});
export default router;
