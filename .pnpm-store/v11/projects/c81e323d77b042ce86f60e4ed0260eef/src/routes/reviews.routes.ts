import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });
const prisma = new PrismaClient();

// POST /api/courses/:courseId/reviews - Create or update a review
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const courseId = Number(req.params.courseId);
    const studentId = req.user!.userId;
    const { rating, comment } = req.body;

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'La calificación es requerida y debe ser un número entre 1 y 5.' });
    }

    // Verify enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        courseId,
        studentId,
      },
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'Solo los estudiantes inscritos pueden calificar este curso.' });
    }

    const review = await prisma.review.upsert({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
      update: {
        rating,
        comment,
      },
      create: {
        studentId,
        courseId,
        rating,
        comment,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating/updating review:', error);
    res.status(500).json({ error: 'Error al enviar la calificación.' });
  }
});

// GET /api/courses/:courseId/reviews - Get reviews and stats
router.get('/', async (req: Request, res: Response) => {
  try {
    const courseId = Number(req.params.courseId);

    const reviews = await prisma.review.findMany({
      where: { courseId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
        : 0;

    // Distribution (1 to 5 stars)
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      const rating = r.rating as 1 | 2 | 3 | 4 | 5;
      if (distribution[rating] !== undefined) {
        distribution[rating]++;
      }
    });

    res.json({
      reviews,
      stats: {
        totalReviews,
        averageRating,
        distribution,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Error al cargar las calificaciones.' });
  }
});

export default router;
