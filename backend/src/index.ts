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

const prisma = new PrismaClient();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }
});

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/projects', authenticate, projectRoutes);
app.use('/api/files', authenticate, fileRoutes);
app.use('/api/compile', authenticate, compileRoutes);
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
    socket.join(`project:${projectId}`);
  });
  
  socket.on('leave-project', (projectId: string) => {
    socket.leave(`project:${projectId}`);
  });
  
  socket.on('file-update', (data: { projectId: string; fileId: string; content: string; userId: string }) => {
    socket.to(`project:${data.projectId}`).emit('file-updated', data);
  });
  
  socket.on('cursor-update', (data: { projectId: string; userId: string; fileId: string; line: number; column: number }) => {
    socket.to(`project:${data.projectId}`).emit('cursor-moved', data);
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
