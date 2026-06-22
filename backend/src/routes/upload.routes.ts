import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Ensure upload dirs exist
const videosDir = path.join(process.cwd(), 'uploads', 'videos');
const imagesDir = path.join(process.cwd(), 'uploads', 'images');
const resourcesDir = path.join(process.cwd(), 'uploads', 'resources');
[videosDir, imagesDir, resourcesDir].forEach(dir => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); });

// Storage for videos
const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, videosDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

// Storage for images
const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, imagesDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

// Storage for resources
const resourceStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, resourcesDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  },
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

const uploadResource = multer({
  storage: resourceStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

// POST /api/upload/video
router.post('/video', authMiddleware, uploadVideo.single('video'), (req: AuthRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No video file provided' });
  const fileUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/videos/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.filename, size: req.file.size });
});

// POST /api/upload/image
router.post('/image', authMiddleware, uploadImage.single('image'), (req: AuthRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No image file provided' });
  const fileUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/images/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.filename, size: req.file.size });
});

// POST /api/upload/resource
router.post('/resource', authMiddleware, uploadResource.single('resource'), (req: AuthRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No resource file provided' });
  const fileUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/resources/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.filename, originalName: req.file.originalname, size: req.file.size });
});

export default router;
