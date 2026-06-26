import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });
const prisma = new PrismaClient();

// POST /api/modules/:moduleId/lessons - Create a lesson
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const moduleId = Number(req.params.moduleId);
    const { title, description, isFree, requiresEvidence } = req.body;

    if (!title) return res.status(400).json({ error: 'title is required' });

    const userRole = await prisma.role.findUnique({ where: { id: req.user!.roleId } });
    const isAdmin = userRole?.name === 'ADMIN';

    // Verify ownership via module → course
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });
    if (!module || (module.course.instructorId !== req.user!.userId && !isAdmin)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const count = await prisma.lesson.count({ where: { moduleId } });

    const lesson = await prisma.lesson.create({
      data: {
        title,
        description: description || '',
        order: count + 1,
        moduleId,
        isFree: isFree === true || isFree === 'true',
        requiresEvidence: requiresEvidence === true || requiresEvidence === 'true',
      },
      include: { video: true, resources: true },
    });

    res.status(201).json(lesson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

// PUT /api/lessons/:id - Update a lesson
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const { title, description, order, isFree, requiresEvidence } = req.body;

    const userRole = await prisma.role.findUnique({ where: { id: req.user!.roleId } });
    const isAdmin = userRole?.name === 'ADMIN';

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    });
    if (!lesson || (lesson.module.course.instructorId !== req.user!.userId && !isAdmin)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order: Number(order) }),
        ...(isFree !== undefined && { isFree: isFree === true || isFree === 'true' }),
        ...(requiresEvidence !== undefined && { requiresEvidence: requiresEvidence === true || requiresEvidence === 'true' }),
      },
      include: { video: true, resources: true },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

// POST /api/lessons/:id/video - Attach a video URL to a lesson
router.post('/:id/video', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const { url, duration } = req.body;

    if (!url) return res.status(400).json({ error: 'url is required' });

    const userRole = await prisma.role.findUnique({ where: { id: req.user!.roleId } });
    const isAdmin = userRole?.name === 'ADMIN';

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    });
    if (!lesson || (lesson.module.course.instructorId !== req.user!.userId && !isAdmin)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Upsert video record
    const video = await prisma.video.upsert({
      where: { lessonId },
      update: { url, ...(duration !== undefined && { duration: Number(duration) }) },
      create: { url, duration: duration ? Number(duration) : null, lessonId },
    });

    res.json(video);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to attach video' });
  }
});

// POST /api/lessons/:id/progress - Save lesson progress for the authenticated student
router.post('/:id/progress', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const { percentage = 100, isCompleted = false } = req.body;
    const studentId = req.user!.userId;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    });
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: { courseId: lesson.module.courseId, studentId },
    });
    if (!enrollment) {
      return res.status(403).json({ error: 'No estás inscrito en este curso' });
    }

    const progressPayload = {
      percentage: Number(percentage),
      isCompleted: Boolean(isCompleted || Number(percentage) >= 100),
    };

    const existingProgress = await prisma.progress.findFirst({
      where: { studentId, lessonId },
      orderBy: { updatedAt: 'desc' },
    });

    const progress = existingProgress
      ? await prisma.progress.update({
          where: { id: existingProgress.id },
          data: progressPayload,
        })
      : await prisma.progress.create({
          data: {
            studentId,
            lessonId,
            ...progressPayload,
          },
        });

    const allLessons = await prisma.lesson.findMany({
      where: { module: { courseId: lesson.module.courseId } },
      select: { id: true },
    });
    const lessonIds = allLessons.map((item) => item.id);
    const completedCount = await prisma.progress.count({
      where: {
        studentId,
        lessonId: { in: lessonIds },
        isCompleted: true,
      },
    });

    const totalLessons = lessonIds.length;
    const computedCourseProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const currentCourseProgress = enrollment.courseProgress ?? 0;
    const courseProgress =
      enrollment.status === 'COMPLETED' || currentCourseProgress >= 100
        ? 100
        : Math.max(currentCourseProgress, computedCourseProgress);

    await prisma.enrollment.updateMany({
      where: { courseId: lesson.module.courseId, studentId },
      data: {
        courseProgress,
        status: courseProgress >= 100 ? 'COMPLETED' : enrollment.status || 'ACTIVE',
      },
    });

    res.json({
      progress,
      courseProgress,
      completedCount,
      totalLessons,
    });
  } catch (error) {
    console.error('Error saving lesson progress:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

// DELETE /api/lessons/:id - Delete a lesson
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const userRole = await prisma.role.findUnique({ where: { id: req.user!.roleId } });
    const isAdmin = userRole?.name === 'ADMIN';

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    });
    if (!lesson || (lesson.module.course.instructorId !== req.user!.userId && !isAdmin)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.lesson.delete({ where: { id: lessonId } });
    res.json({ message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

// POST /api/lessons/:id/resources - Attach a resource file to a lesson
router.post('/:id/resources', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const { name, url, type } = req.body;

    if (!name || !url || !type) {
      return res.status(400).json({ error: 'name, url, and type are required' });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    });

    const userRole = await prisma.role.findUnique({ where: { id: req.user!.roleId } });
    const isAdmin = userRole?.name === 'ADMIN';

    if (!lesson || (lesson.module.course.instructorId !== req.user!.userId && !isAdmin)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const resource = await prisma.resource.create({
      data: {
        name,
        url,
        type,
        lessonId,
      },
    });

    res.status(201).json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add resource' });
  }
});

// DELETE /api/lessons/:lessonId/resources/:id - Delete a resource from a lesson
router.delete('/:lessonId/resources/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = Number(req.params.lessonId);
    const resourceId = Number(req.params.id);

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    });

    const userRole = await prisma.role.findUnique({ where: { id: req.user!.roleId } });
    const isAdmin = userRole?.name === 'ADMIN';

    if (!lesson || (lesson.module.course.instructorId !== req.user!.userId && !isAdmin)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.resource.delete({
      where: { id: resourceId },
    });

    res.json({ message: 'Resource deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

export default router;
