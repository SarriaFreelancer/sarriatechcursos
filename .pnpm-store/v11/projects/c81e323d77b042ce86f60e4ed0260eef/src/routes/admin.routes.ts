import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware, requireRole('ADMIN'));

router.get('/overview', async (_req: AuthRequest, res: Response) => {
  try {
    const [courses, enrollments] = await Promise.all([
      prisma.course.findMany({
        include: {
          instructor: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.enrollment.findMany({
        include: {
          student: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalStudents = new Set(enrollments.map((enrollment) => enrollment.studentId)).size;

    const coursesWithStats = courses.map((course) => {
      const courseEnrollments = enrollments.filter((enrollment) => enrollment.courseId === course.id);

      const students = courseEnrollments.map((enrollment) => {
        // Use the same source as the student view: enrollment.courseProgress
        const rawProgress = enrollment.courseProgress ?? 0;
        const progress =
          enrollment.status === 'COMPLETED' || rawProgress >= 100 ? 100 : rawProgress;

        return {
          studentId: enrollment.student.id,
          name: enrollment.student.name,
          email: enrollment.student.email,
          enrolledAt: enrollment.createdAt,
          progress,
          lastProgressAt: enrollment.updatedAt,
        };
      });

      const averageProgress =
        students.length === 0
          ? 0
          : Math.round(
              (students.reduce((sum, s) => sum + s.progress, 0) / students.length) * 100
            ) / 100;

      return {
        id: course.id,
        title: course.title,
        category: course.category,
        instructor: course.instructor,
        enrolledStudents: courseEnrollments.length,
        averageProgress,
        students,
      };
    });

    const totalEnrollments = enrollments.length;
    const averageCourseProgress =
      coursesWithStats.length === 0
        ? 0
        : Math.round(
            (coursesWithStats.reduce((sum, course) => sum + course.averageProgress, 0) / coursesWithStats.length) * 100
          ) / 100;

    res.json({
      totals: {
        totalStudents,
        totalEnrollments,
        totalCourses: courses.length,
        averageCourseProgress,
      },
      courses: coursesWithStats,
    });
  } catch (error) {
    console.error('Error fetching admin overview:', error);
    res.status(500).json({ error: 'Failed to fetch admin overview' });
  }
});

router.get('/courses/:courseId/students', async (req: AuthRequest, res: Response) => {
  try {
    const courseId = Number(req.params.courseId);

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
      },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const students = enrollments.map((enrollment) => {
      // Use the same source as the student view: enrollment.courseProgress
      const rawProgress = enrollment.courseProgress ?? 0;
      const progress =
        enrollment.status === 'COMPLETED' || rawProgress >= 100 ? 100 : rawProgress;

      return {
        studentId: enrollment.student.id,
        name: enrollment.student.name,
        email: enrollment.student.email,
        enrolledAt: enrollment.createdAt,
        progress,
        lastProgressAt: enrollment.updatedAt,
      };
    });

    res.json({
      course: {
        id: course.id,
        title: course.title,
        instructor: course.instructor,
        category: course.category,
      },
      students,
    });
  } catch (error) {
    console.error('Error fetching course students for admin:', error);
    res.status(500).json({ error: 'Failed to fetch course students' });
  }
});

router.get('/users', async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: { select: { id: true, name: true } },
        _count: { select: { courses: true, enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(
      users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role.name,
        coursesCreated: user._count.courses,
        coursesEnrolled: user._count.enrollments,
        createdAt: user.createdAt,
      }))
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.put('/users/:userId/role', async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const { roleName } = req.body;

    if (!['ADMIN', 'INSTRUCTOR', 'STUDENT'].includes(roleName)) {
      return res.status(400).json({ error: 'Rol inválido. Usa ADMIN, INSTRUCTOR o STUDENT.' });
    }

    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      return res.status(400).json({ error: 'Rol no encontrado' });
    }

    if (userId === req.user!.userId && roleName !== 'ADMIN') {
      return res.status(400).json({ error: 'No puedes quitarte el rol de administrador a ti mismo.' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { roleId: role.id },
      include: { role: true },
    });

    res.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      roleId: updated.roleId,
      roleName: updated.role.name,
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

export default router;
