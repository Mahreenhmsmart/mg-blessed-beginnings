import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Project, { type IProject } from '../models/Project';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  /** Attached by verifyProjectOwnership middleware - typed as IProject for type safety */
  verifiedProject?: IProject;
}

export function protect(req: AuthRequest, res: Response, next: NextFunction): void {
  // Extract token from Authorization header (priority) or cookie (fallback)
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if ((req as any).cookies?.token) {
    // Fallback: check for JWT in cookies (enables browser-based access after login)
    token = (req as any).cookies.token;
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({
        success: false,
        message: 'Server configuration error.',
      });
      return;
    }

    const decoded = jwt.verify(token, secret) as { id?: string; email: string; name?: string; role: string };
    req.user = {
      id: decoded.id || '',
      email: decoded.email,
      name: decoded.name || '',
      role: decoded.role,
    };
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
}

/**
 * Middleware factory that restricts access to users with specific roles.
 * Must be used after `protect` so that `req.user` is populated.
 */
export function restrictTo(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
      return;
    }
    next();
  };
}

/**
 * Middleware that verifies the authenticated user owns the project referenced
 * in the route params. Checks both `req.params.id` and `req.params.projectId`.
 * Returns 404 (not 403) when the project is not found or not owned by the user,
 * to prevent project enumeration. Attaches the project document to
 * `req.verifiedProject` for downstream use.
 *
 * Must be used after `protect` so that `req.user` is populated.
 */
export async function verifyProjectOwnership(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated.' });
      return;
    }

    // Support both param naming conventions used across routes
    const projectId = req.params.projectId || req.params.id;

    if (!projectId) {
      res.status(400).json({ success: false, error: 'Project identifier is required.' });
      return;
    }

    // Validate ObjectId format before querying
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }

    // Project.userId stores the user's email (see createProject controller)
    const userId = req.user.email;

    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      // Return 404 to prevent enumeration — don't reveal whether the project exists
      console.warn(
        `[authz] Ownership check failed: user=${userId} projectId=${projectId}`,
      );
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }

    req.verifiedProject = project;
    next();
  } catch (err) {
    next(err);
  }
}
