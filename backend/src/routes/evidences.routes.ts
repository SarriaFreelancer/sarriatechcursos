import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/evidences/instructor - Get all evidence submissions for courses taught by the instructor
router.get('/instructor', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const instructorId = req.user!.userId;
    const userRole = await prisma.role.findUnique({ where: { id: req.user!.roleId } });
    const isAdmin = userRole?.name === 'ADMIN';

    // Find all lessons belonging to courses taught by this instructor (or all if admin)
    const submissions = await prisma.evidenceSubmission.findMany({
      where: isAdmin ? {} : {
        lesson: {
          module: {
            course: {
              instructorId
            }
          }
        }
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        lesson: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                course: {
                  select: { id: true, title: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch evidences' });
  }
});

// POST /api/evidences - Submit evidence (student)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { lessonId, url } = req.body;

    if (!lessonId || !url) {
      return res.status(400).json({ error: 'lessonId and url are required' });
    }

    const lesson = await prisma.lesson.findUnique({ where: { id: Number(lessonId) } });
    if (!lesson || !lesson.requiresEvidence) {
      return res.status(400).json({ error: 'Lesson does not require evidence' });
    }

    // Check if there is already a submission for this lesson by this student
    const existing = await prisma.evidenceSubmission.findFirst({
      where: { studentId, lessonId: Number(lessonId) }
    });

    if (existing) {
      // Update existing submission to PENDING again if resubmitted
      const updated = await prisma.evidenceSubmission.update({
        where: { id: existing.id },
        data: { url, status: 'PENDING', feedback: null }
      });
      return res.json(updated);
    }

    const submission = await prisma.evidenceSubmission.create({
      data: {
        studentId,
        lessonId: Number(lessonId),
        url,
        status: 'PENDING'
      }
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit evidence' });
  }
});

// PUT /api/evidences/:id/evaluate - Approve or reject evidence (instructor)
router.put('/:id/evaluate', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const evidenceId = Number(req.params.id);
    const { status, feedback } = req.body; // status should be 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'status must be APPROVED or REJECTED' });
    }

    const submission = await prisma.evidenceSubmission.findUnique({
      where: { id: evidenceId },
      include: {
        lesson: {
          include: {
            module: {
              include: { course: true }
            }
          }
        }
      }
    });

    if (!submission) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    const userRole = await prisma.role.findUnique({ where: { id: req.user!.roleId } });
    const isAdmin = userRole?.name === 'ADMIN';

    if (submission.lesson.module.course.instructorId !== req.user!.userId && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.evidenceSubmission.update({
      where: { id: evidenceId },
      data: {
        status,
        feedback: feedback || null
      }
    });

    // Optionally notify the student
    await prisma.notification.create({
      data: {
        userId: submission.studentId,
        title: `Evidencia ${status === 'APPROVED' ? 'Aprobada' : 'Rechazada'}`,
        message: `Tu evidencia para la lección "${submission.lesson.title}" ha sido evaluada. ${feedback ? `Feedback: ${feedback}` : ''}`
      }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to evaluate evidence' });
  }
});

// GET /api/evidences/lesson/:lessonId/me - Get my submission for a specific lesson
router.get('/lesson/:lessonId/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const lessonId = Number(req.params.lessonId);

    const submission = await prisma.evidenceSubmission.findFirst({
      where: { studentId, lessonId }
    });

    if (!submission) {
      return res.status(404).json({ error: 'No submission found' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get submission' });
  }
});

export default router;
