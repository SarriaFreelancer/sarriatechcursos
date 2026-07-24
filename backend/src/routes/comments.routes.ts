import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });
const prisma = new PrismaClient();

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = Number(req.params.lessonId);

    const comments = await prisma.comment.findMany({
      where: { lessonId },
      include: {
        user: { select: { id: true, name: true, email: true, profilePicture: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = Number(req.params.lessonId);
    const { content, parentId } = req.body;
    const userId = req.user!.userId;

    if (!content || !String(content).trim()) {
      return res.status(400).json({ error: 'content is required' });
    }

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    let parentCommentId: number | null = null;

    if (parentId !== undefined && parentId !== null && parentId !== '') {
      const parsedParentId = Number(parentId);
      const parentComment = await prisma.comment.findUnique({
        where: { id: parsedParentId },
      });

      if (!parentComment || parentComment.lessonId !== lessonId) {
        return res.status(400).json({ error: 'Invalid parent comment' });
      }

      parentCommentId = parsedParentId;
    }

    const comment = await prisma.comment.create({
      data: {
        content: String(content).trim(),
        lessonId,
        userId,
        parentId: parentCommentId,
      },
      include: {
        user: { select: { id: true, name: true, email: true, profilePicture: true } },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

export default router;
