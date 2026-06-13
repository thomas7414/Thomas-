import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../db';
import { APIError } from '../middleware/errorHandler';

const router = Router();

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      createdAt: true,
      subscription: true,
    },
  });

  if (!user) {
    throw new APIError(404, 'User not found');
  }

  res.json(user);
});

// Update user profile
router.put('/me', authenticateToken, async (req: AuthRequest, res) => {
  const { name, avatar } = req.body;

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: {
      ...(name && { name }),
      ...(avatar && { avatar }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
    },
  });

  res.json(user);
});

// Get user subscription
router.get('/subscription', authenticateToken, async (req: AuthRequest, res) => {
  const subscription = await prisma.subscription.findFirst({
    where: { userId: req.userId },
  });

  res.json(subscription || { plan: 'free' });
});

export default router;
