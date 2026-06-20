import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export interface AuthRequest extends Request {
  user?: { userId: number; roleId: number; roleName?: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; roleId: number };
    req.user = { userId: decoded.userId, roleId: decoded.roleId };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export function requireRole(...allowedRoles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const roleId = req.user?.roleId;

    if (!roleId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role || !allowedRoles.includes(role.name)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }

    req.user!.roleName = role.name;
    next();
  };
}

export async function isAdmin(userId: number, roleId: number): Promise<boolean> {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  return role?.name === 'ADMIN';
}
