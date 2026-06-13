import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import 'express-async-errors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import projectRoutes from './routes/projects';
import aiAgentRoutes from './routes/ai-agents';
import hostingRoutes from './routes/hosting';
import billingRoutes from './routes/billing';
import collaborationRoutes from './routes/collaboration';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

const app: Express = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(requestLogger);

// Attach io to app
app.set('io', io);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai-agents', aiAgentRoutes);
app.use('/api/hosting', hostingRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/collaboration', collaborationRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Handler (must be last)
app.use(errorHandler);

// WebSocket Events
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-project', (projectId: string) => {
    socket.join(`project-${projectId}`);
  });

  socket.on('leave-project', (projectId: string) => {
    socket.leave(`project-${projectId}`);
  });

  socket.on('code-change', (data: any) => {
    socket.to(`project-${data.projectId}`).emit('code-change', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start Server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`
🚀 OpenDev Backend running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database: ${process.env.DATABASE_URL?.split('@')[1] || 'unknown'}`);
});

export { app, io };
