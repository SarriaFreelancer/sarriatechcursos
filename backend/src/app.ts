import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import commentRoutes from './routes/comments.routes';
import courseRoutes from './routes/courses.routes';
import moduleRoutes from './routes/modules.routes';
import lessonRoutes from './routes/lessons.routes';
import uploadRoutes from './routes/upload.routes';
import reviewRoutes from './routes/reviews.routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve uploaded files as static assets
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Swagger placeholder
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "SarriaTech API",
    version: "1.0.0",
    description: "API for SarriaTech E-Learning Platform"
  },
  paths: {}
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/courses/:courseId/modules', moduleRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/modules/:moduleId/lessons', lessonRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/lessons/:lessonId/comments', commentRoutes);
app.use('/api/courses/:courseId/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'SarriaTech API is running' });
});

export default app;
