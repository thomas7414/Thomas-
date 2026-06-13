import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../db';
import { APIError } from '../middleware/errorHandler';

const router = Router();

// Get project files
router.get('/:projectId/files', authenticateToken, async (req: AuthRequest, res: Response) => {
  const files = await prisma.projectFile.findMany({
    where: { projectId: req.params.projectId },
    orderBy: { createdAt: 'desc' },
  });

  res.json(files);
});

// Create/Update file
router.post('/:projectId/files', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { path, content, language } = req.body;
  const { projectId } = req.params;

  // Check if file exists
  const existingFile = await prisma.projectFile.findFirst({
    where: { projectId, path },
  });

  let file;
  if (existingFile) {
    file = await prisma.projectFile.update({
      where: { id: existingFile.id },
      data: { content, language, updatedAt: new Date() },
    });
  } else {
    file = await prisma.projectFile.create({
      data: {
        projectId,
        path,
        content,
        language,
      },
    });
  }

  res.json(file);
});

// Delete file
router.delete('/:projectId/files/:fileId', authenticateToken, async (req: AuthRequest, res: Response) => {
  await prisma.projectFile.delete({
    where: { id: req.params.fileId },
  });

  res.json({ message: 'File deleted' });
});

// Get project preview
router.get('/:projectId/preview', authenticateToken, async (req: AuthRequest, res: Response) => {
  // TODO: Generate preview HTML
  const preview = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Preview</title>
        <style>body { font-family: sans-serif; margin: 20px; }</style>
      </head>
      <body>
        <h1>Live Preview</h1>
        <p>Your project preview will appear here</p>
      </body>
    </html>
  `;

  res.set('Content-Type', 'text/html');
  res.send(preview);
});

export default router;
