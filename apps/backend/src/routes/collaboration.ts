import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../db';
import { APIError } from '../middleware/errorHandler';

const router = Router();

// Invite user to project
router.post('/:projectId/invite', authenticateToken, async (req: AuthRequest, res) => {
  const { email, role } = req.body;

  const project = await prisma.project.findUnique({
    where: { id: req.params.projectId },
  });

  if (!project || project.userId !== req.userId) {
    throw new APIError(403, 'Unauthorized');
  }

  // TODO: Send invitation email
  // TODO: Create invitation record

  res.json({ message: 'Invitation sent' });
});

// Get project collaborators
router.get('/:projectId/collaborators', authenticateToken, async (req: AuthRequest, res) => {
  const collaborators = await prisma.projectCollaborator.findMany({
    where: { projectId: req.params.projectId },
    include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
  });

  res.json(collaborators);
});

export default router;
