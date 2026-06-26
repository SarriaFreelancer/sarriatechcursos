import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });
const prisma = new PrismaClient();

// POST /api/courses/:courseId/modules - Create a module
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const courseId = Number(req.params.courseId);
    const { title } = req.body;

    if (!title) return res.status(400).json({ error: 'title is required' });

    const userRole = await prisma.role.findUnique({ where: { id: req.user!.roleId } });
    const isAdmin = userRole?.name === 'ADMIN';

    // Verify ownership
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || (course.instructorId !== req.user!.userId && !isAdmin)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Calculate next order
    const count = await prisma.module.count({ where: { courseId } });

    const module = await prisma.module.create({
      data: { title, order: count + 1, courseId },
      include: { lessons: true },
    });

    res.status(201).json(module);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create module' });
  }
});

// PUT /api/modules/:id - Update a module
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const moduleId = Number(req.params.id);
    const { title, order } = req.body;

    const userRole = await prisma.role.findUnique({ where: { id: req.user!.roleId } });
    const isAdmin = userRole?.name === 'ADMIN';

    const mod = await prisma.module.findUnique({ where: { id: moduleId }, include: { course: true } });
    if (!mod || (mod.course.instructorId !== req.user!.userId && !isAdmin)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.module.update({
      where: { id: moduleId },
      data: {
        ...(title && { title }),
        ...(order !== undefined && { order: Number(order) }),
      },
      include: { lessons: true },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update module' });
  }
});

// DELETE /api/modules/:id - Delete a module
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const moduleId = Number(req.params.id);
    const userRole = await prisma.role.findUnique({ where: { id: req.user!.roleId } });
    const isAdmin = userRole?.name === 'ADMIN';

    const mod = await prisma.module.findUnique({ where: { id: moduleId }, include: { course: true } });
    if (!mod || (mod.course.instructorId !== req.user!.userId && !isAdmin)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.module.delete({ where: { id: moduleId } });
    res.json({ message: 'Module deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete module' });
  }
});

export default router;
