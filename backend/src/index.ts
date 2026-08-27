import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import fileRoutes from './routes/files';
import compileRoutes from './routes/compile';
import commentRoutes from './routes/comments';
import shareRoutes from './routes/shares';
import templateRoutes from './routes/templates';
import userRoutes from './routes/users';
import { authenticate } from './middleware/auth';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const prisma = new PrismaClient();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return next(new Error('Authentication required'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
    socket.data.userId = decoded.userId;
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
});

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-7', legacyHeaders: false });
const compileLimiter = rateLimit({ windowMs: 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false });

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/files', authenticate, fileRoutes);
app.use('/api/compile', authenticate, compileLimiter, compileRoutes);
app.use('/api/comments', authenticate, commentRoutes);
app.use('/api/shares', shareRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/users', authenticate, userRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-project', (projectId: string) => {
    prisma.project.findFirst({
      where: { id: projectId, OR: [{ ownerId: socket.data.userId }, { members: { some: { userId: socket.data.userId } } }, { isPublic: true }] },
      select: { id: true },
    }).then(project => { if (project) socket.join(`project:${projectId}`); });
  });
  
  socket.on('leave-project', (projectId: string) => {
    socket.leave(`project:${projectId}`);
  });
  
  socket.on('file-update', (data: { projectId: string; fileId: string; content: string }) => {
    prisma.project.findFirst({ where: { id: data.projectId, OR: [{ ownerId: socket.data.userId }, { members: { some: { userId: socket.data.userId } } }] }, select: { id: true } })
      .then(project => { if (project) socket.to(`project:${data.projectId}`).emit('file-updated', { ...data, userId: socket.data.userId }); });
  });
  
  socket.on('cursor-update', (data: { projectId: string; userId: string; fileId: string; line: number; column: number }) => {
    prisma.project.findFirst({ where: { id: data.projectId, OR: [{ ownerId: socket.data.userId }, { members: { some: { userId: socket.data.userId } } }] }, select: { id: true } })
      .then(project => { if (project) socket.to(`project:${data.projectId}`).emit('cursor-moved', { ...data, userId: socket.data.userId }); });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

async function main() {
  await prisma.$connect();
  console.log('Database connected');
  
  server.listen(PORT, () => {
    console.log(`TexFlow API running on port ${PORT}`);
  });
}

main().catch(console.error);

export { prisma, io };
