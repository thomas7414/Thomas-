import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../db';
import { APIError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all projects for user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  const projects = await prisma.project.findMany({
    where: { userId: req.userId },
    include: {
      collaborators: true,
      deployments: { take: 1, orderBy: { createdAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(projects);
});

// Create project
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  const { name, description, type, language, framework, database } = req.body;

  const project = await prisma.project.create({
    data: {
      id: uuidv4(),
      name,
      description,
      type,
      language,
      framework,
      database,
      userId: req.userId!,
      status: 'initializing',
    },
  });

  res.status(201).json(project);
});

// Get project by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      collaborators: true,
      files: true,
      deployments: true,
    },
  });

  if (!project) {
    throw new APIError(404, 'Project not found');
  }

  res.json(project);
});

// Update project
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  const { name, description, status } = req.body;

  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: {
      ...(name && { name }),
      ...(description && { description }),
      ...(status && { status }),
    },
  });

  res.json(project);
});

// Delete project
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  await prisma.project.delete({
    where: { id: req.params.id },
  });

  res.json({ message: 'Project deleted' });
});

export default router;
