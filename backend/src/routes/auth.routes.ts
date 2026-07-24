import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { randomBytes } from 'crypto';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

async function getStudentRoleId() {
  let studentRole = await prisma.role.findUnique({ where: { name: 'STUDENT' } });

  if (!studentRole) {
    studentRole = await prisma.role.create({ data: { name: 'STUDENT' } });
  }

  return studentRole.id;
}

async function buildAuthResponse(user: { id: number; name: string; email: string; roleId: number }) {
  const role = await prisma.role.findUnique({ where: { id: user.roleId } });
  const token = jwt.sign(
    { userId: user.id, roleId: user.roleId },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    { expiresIn: '7d' }
  );

  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      roleName: role?.name ?? 'STUDENT'
    }
  };
}

function formatDuration(seconds: number) {
  const totalMinutes = Math.max(0, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} minutos`;
  }

  return minutes > 0 ? `${hours} horas ${minutes} minutos` : `${hours} horas`;
}

// Register Endpoint
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const studentRoleId = await getStudentRoleId();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: studentRoleId
      }
    });

    const authResponse = await buildAuthResponse(user);
    res.status(201).json({ message: 'User registered successfully', ...authResponse });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login Endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json(await buildAuthResponse(user));
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// Google Auth Endpoint
router.post('/google', async (req: Request, res: Response) => {
  try {
    if (!googleClient || !googleClientId) {
      return res.status(500).json({ message: 'Google authentication is not configured' });
    }

    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;

    if (!email) {
      return res.status(400).json({ message: 'Google account email was not provided' });
    }

    const name = payload?.name || payload?.given_name || email.split('@')[0];
    const existingUser = await prisma.user.findUnique({ where: { email } });
    const roleId = existingUser?.roleId || await getStudentRoleId();

    const user = existingUser ?? await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(randomBytes(32).toString('hex'), 10),
        roleId,
      }
    });

    res.json(await buildAuthResponse(user));
  } catch (error) {
    res.status(401).json({ message: 'Google authentication failed' });
  }
});

// GET /api/auth/profile - Fetch full user profile, stats, and course progress
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        enrollments: {
          include: {
            course: {
              include: {
                category: true,
                instructor: { select: { name: true } },
                modules: {
                  include: {
                    lessons: {
                      include: {
                        video: true,
                        progress: {
                          where: { studentId: userId },
                          orderBy: { updatedAt: 'desc' },
                          take: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        certificates: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Calculate stats
    const totalCourses = user.enrollments.length;

    let completedCoursesCount = 0;
    let totalProgressSum = 0;
    let completedLessonsCount = 0;
    // certificatesCount will be set after processing enrollments

    const processedEnrollments = [];
    for (const enrollment of user.enrollments) {
      const course = enrollment.course;
      const totalLessons = course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
      const totalDurationSeconds = course.modules.reduce((moduleSum, mod) => {
        return moduleSum + mod.lessons.reduce((lessonSum, lesson) => lessonSum + (lesson.video?.duration ?? 0), 0);
      }, 0);
      
      let completedLessonsInCourse = 0;
      course.modules.forEach((mod) => {
        mod.lessons.forEach((lesson) => {
          const prog = lesson.progress[0];
          if (prog && (prog.isCompleted || enrollment.status === 'COMPLETED')) {
            completedLessonsInCourse++;
            completedLessonsCount++;
          }
        });
      });

      const storedProgress = enrollment.courseProgress ?? 0;
      const computedProgress = totalLessons > 0 ? Math.round((completedLessonsInCourse / totalLessons) * 100) : 0;
      const progressPercentage =
        enrollment.status === 'COMPLETED' || storedProgress >= 100
          ? 100
          : Math.max(storedProgress, computedProgress);
      totalProgressSum += progressPercentage;

      if (enrollment.courseProgress !== progressPercentage) {
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { courseProgress: progressPercentage },
        });
      }

      if (progressPercentage === 100 && totalLessons > 0) {
        completedCoursesCount++;
      }

      processedEnrollments.push({
        id: enrollment.id,
        courseId: course.id,
        title: course.title,
        imageUrl: course.imageUrl,
        instructorName: course.instructor.name,
        category: course.category.name,
        progress: progressPercentage,
        courseProgress: progressPercentage,
        status: enrollment.status === 'COMPLETED' || progressPercentage >= 100 ? 'COMPLETED' : enrollment.status,
        enrolledAt: enrollment.createdAt,
        courseDurationSeconds: totalDurationSeconds,
        courseDuration: formatDuration(totalDurationSeconds),
      });
    }
const certificatesCount = completedCoursesCount; // número de certificados basado en cursos completados al 100%
    const averageProgress = totalCourses > 0 ? Math.round(totalProgressSum / totalCourses) : 0;
    const studyHours = Math.round(completedLessonsCount * 0.4 * 10) / 10;

    const response: Record<string, unknown> = {
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        theme: user.theme,
        emailNotifications: user.emailNotifications,
        isPrivate: user.isPrivate,
        createdAt: user.createdAt,
        roleName: user.role.name,
        lastAccess: user.updatedAt,
      },
      stats: {
        coursesEnrolled: totalCourses,
        coursesCompleted: completedCoursesCount,
        certificatesCount,
        studyHours,
        averageProgress,
      },
      enrollments: processedEnrollments,
    };

    if (user.role.name === 'INSTRUCTOR' || user.role.name === 'ADMIN') {
      const instructorCourses = await prisma.course.findMany({
        where: { instructorId: userId },
        include: {
          category: true,
          _count: { select: { enrollments: true, modules: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      response.instructorStats = {
        coursesCreated: instructorCourses.length,
        publishedCourses: instructorCourses.filter((c) => c.status === 'PUBLISHED').length,
        draftCourses: instructorCourses.filter((c) => c.status === 'DRAFT').length,
        totalEnrollments: instructorCourses.reduce((sum, c) => sum + c._count.enrollments, 0),
        totalModules: instructorCourses.reduce((sum, c) => sum + c._count.modules, 0),
      };

      response.teachingCourses = instructorCourses.map((course) => ({
        id: course.id,
        title: course.title,
        status: course.status,
        category: course.category.name,
        enrollments: course._count.enrollments,
        createdAt: course.createdAt,
      }));
    }

    if (user.role.name === 'ADMIN') {
      const [totalUsers, totalCoursesCount, totalEnrollments] = await Promise.all([
        prisma.user.count(),
        prisma.course.count(),
        prisma.enrollment.count(),
      ]);

      response.adminStats = {
        totalUsers,
        totalCourses: totalCoursesCount,
        totalEnrollments,
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Error fetching user profile stats:', error);
    res.status(500).json({ error: 'Failed to fetch user profile stats' });
  }
});

// PUT /api/auth/profile - Update user profile and settings
router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, email, profilePicture, theme, emailNotifications, isPrivate } = req.body;

    // Check if email already exists for another user
    if (email) {
      const existing = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId }
        }
      });

      if (existing) {
        return res.status(400).json({ error: 'El correo electrónico ya está registrado por otro usuario.' });
      }
    }

    // Build data object with only defined fields
    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (email !== undefined) dataToUpdate.email = email;
    if (profilePicture !== undefined) dataToUpdate.profilePicture = profilePicture;
    if (theme !== undefined) dataToUpdate.theme = theme;
    if (emailNotifications !== undefined) dataToUpdate.emailNotifications = emailNotifications;
    if (isPrivate !== undefined) dataToUpdate.isPrivate = isPrivate;

    if (Object.keys(dataToUpdate).length === 0) {
       return res.status(400).json({ error: 'No data provided to update' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      include: { role: true }
    });

    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      profilePicture: updatedUser.profilePicture,
      theme: updatedUser.theme,
      emailNotifications: updatedUser.emailNotifications,
      isPrivate: updatedUser.isPrivate,
      roleId: updatedUser.roleId,
      roleName: updatedUser.role.name
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
});

// PUT /api/auth/password - Update user password
router.put('/password', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'La contraseña actual y la nueva son requeridas.' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Contraseña actualizada con éxito.' });
  } catch (error) {
    console.error('Error updating user password:', error);
    res.status(500).json({ error: 'Error al actualizar la contraseña' });
  }
});

export default router;
