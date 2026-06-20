import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { authMiddleware, AuthRequest, requireRole, isAdmin } from '../middleware/auth.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const router = Router();
const prisma = new PrismaClient();
const defaultCategories = [
  'Desarrollo Web',
  'Inteligencia Artificial',
  'Ciberseguridad',
  'Bases de Datos',
  'Diseño UX/UI',
  'DevOps y Cloud',
  'Mobile Development',
  'Data Science',
];

async function ensureDefaultCategories() {
  const existingCategories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  if (existingCategories.length > 0) {
    return existingCategories;
  }

  await prisma.category.createMany({
    data: defaultCategories.map((name) => ({ name })),
    skipDuplicates: true,
  });

  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

router.post('/categories', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const categoryName = String(name || '').trim();

    if (!categoryName) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const existing = await prisma.category.findUnique({ where: { name: categoryName } });
    if (existing) {
      return res.status(200).json(existing);
    }

    const category = await prisma.category.create({
      data: { name: categoryName },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Create a new course (Instructor or Admin only)
router.post('/', authMiddleware, requireRole('INSTRUCTOR', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, price, level, categoryId, imageUrl, videoUrl } = req.body;
    const instructorId = req.user!.userId;

    if (!title || !description || price === undefined || !level || !categoryId) {
      return res.status(400).json({ error: 'Missing required fields: title, description, price, level, categoryId' });
    }

    // Ensure category exists, create if not
    let category = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
    if (!category) {
      return res.status(400).json({ error: 'Category not found' });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        price: Number(price),
        level,
        status: 'DRAFT',
        instructorId,
        categoryId: Number(categoryId),
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
      },
      include: {
        category: true,
        modules: true,
      }
    });

    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Get all published courses (public)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        category: true,
        instructor: { select: { id: true, name: true, email: true } },
        _count: { select: { enrollments: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const coursesWithRating = courses.map((course) => {
      const totalReviews = course.reviews.length;
      const averageRating =
        totalReviews > 0
          ? Math.round((course.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
          : 0;

      const { reviews, ...rest } = course;
      return {
        ...rest,
        averageRating,
        totalReviews,
      };
    });

    res.json(coursesWithRating);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get categories list
router.get('/categories', async (_req, res: Response) => {
  try {
    const categories = await ensureDefaultCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get instructor's own courses
router.get('/mine', authMiddleware, requireRole('INSTRUCTOR', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const instructorId = req.user!.userId;
    const courses = await prisma.course.findMany({
      where: { instructorId },
      include: {
        category: true,
        _count: { select: { enrollments: true } },
        reviews: { select: { rating: true } },
        modules: {
          include: {
            lessons: {
              include: { video: true },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const coursesWithRating = courses.map((course) => {
      const totalReviews = course.reviews.length;
      const averageRating =
        totalReviews > 0
          ? Math.round((course.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
          : 0;

      return {
        ...course,
        averageRating,
        totalReviews,
      };
    });

    res.json(coursesWithRating);
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get a single course with full details
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const courseId = Number(req.params.id);
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        category: true,
        instructor: { select: { id: true, name: true, email: true } },
        reviews: {
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              include: {
                video: true,
                resources: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    let isEnrolled = false;
    let userId: number | null = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; roleId: number };
        userId = decoded.userId;

        if (userId === course.instructorId) {
          isEnrolled = true;
        } else {
          const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
          if (user?.role.name === 'ADMIN') {
            isEnrolled = true;
          } else {
            const enrollment = await prisma.enrollment.findFirst({
              where: { courseId, studentId: userId },
            });
            if (enrollment) {
              isEnrolled = true;
            }
          }
        }
      } catch (err) {
        // Invalid token
      }
    }

    const totalReviews = course.reviews.length;
    const averageRating =
      totalReviews > 0
        ? Math.round((course.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
        : 0;

    // Filter/protect lesson videos if not enrolled
    const sanitizedModules = course.modules.map((mod) => ({
      ...mod,
      lessons: mod.lessons.map((lesson) => {
        if (!isEnrolled && !lesson.isFree) {
          return {
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            order: lesson.order,
            moduleId: lesson.moduleId,
            isFree: lesson.isFree,
            video: null, // Lock it
            resources: [], // Lock resources
            locked: true,
          };
        }
        return {
          ...lesson,
          locked: !isEnrolled,
        };
      }),
    }));

    res.json({
      id: course.id,
      title: course.title,
      description: course.description,
      imageUrl: course.imageUrl,
      thumbnailUrl: course.thumbnailUrl,
      videoUrl: course.videoUrl,
      level: course.level,
      price: course.price,
      status: course.status,
      instructorId: course.instructorId,
      categoryId: course.categoryId,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      category: course.category,
      instructor: course.instructor,
      reviews: course.reviews,
      modules: sanitizedModules,
      isEnrolled,
      averageRating,
      totalReviews,
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Update a course
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const courseId = Number(req.params.id);
    const instructorId = req.user!.userId;

    // Check if user is admin
    const userRole = await prisma.role.findUnique({ where: { id: req.user!.roleId } });
    const isAdmin = userRole?.name === 'ADMIN';

    // Check ownership or admin
    const existing = await prisma.course.findUnique({ where: { id: courseId } });
    if (!existing || (existing.instructorId !== instructorId && !isAdmin)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { title, description, price, level, status, categoryId, imageUrl, videoUrl } = req.body;

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(level && { level }),
        ...(status && { status }),
        ...(categoryId && { categoryId: Number(categoryId) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(videoUrl !== undefined && { videoUrl }),
      },
      include: {
        category: true,
        modules: {
          include: { lessons: { include: { video: true } } },
          orderBy: { order: 'asc' },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Enroll in a course (Purchase)
router.post('/:id/enroll', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const courseId = Number(req.params.id);
    const studentId = req.user!.userId;

    const existing = await prisma.enrollment.findFirst({
      where: { courseId, studentId },
    });

    if (existing) {
      return res.status(400).json({ error: 'Ya estás inscrito en este curso.' });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        courseId,
        studentId,
        status: 'ACTIVE',
      },
    });

    res.status(201).json(enrollment);
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ error: 'Failed to enroll in course' });
  }
});

export default router;
