import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import User from '../models/User';
import { protect, restrictTo } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { applyReferralCode } from '../services/referralService';

const router = Router();

// Security fix: Strict rate limiting on authentication endpoints to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' },
  skipSuccessfulRequests: true, // Don't count successful logins against the limit
});

// ─── Login ──────────────────────────────────────────────────────────────────
router.post('/login', authLimiter, async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: 'Email and password are required.',
    });
    return;
  }

  try {
    // Normalize email for lookup (schema stores lowercase)
    const normalizedEmail = email.toLowerCase().trim();

    // Look up user in database
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // Database-backed authentication
      if (!user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Account is deactivated.',
        });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        // Security fix: Don't log email on password mismatch to prevent user enumeration via logs
        console.warn('[auth/login] Password mismatch (email redacted for security)');
        res.status(401).json({
          success: false,
          message: 'Invalid credentials.',
        });
        return;
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        res.status(500).json({
          success: false,
          message: 'Server configuration error.',
        });
        return;
      }

      const token = jwt.sign(
        { id: user._id.toString(), email: user.email, name: user.name, role: user.role },
        secret,
        { expiresIn: '24h' },
      );

      // Set cookie for browser-based access (e.g. diagnostic endpoints)
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/',
      });

      res.json({
        success: true,
        data: {
          token,
          user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
        },
      });
      return;
    }

    // Fallback: env-var admin (deprecated, for backward compatibility)
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        res.status(500).json({
          success: false,
          message: 'Server configuration error.',
        });
        return;
      }

      const token = jwt.sign(
        { id: 'legacy-admin', email: adminEmail, name: 'Admin', role: 'admin' },
        secret,
        { expiresIn: '24h' },
      );

      // Set cookie for browser-based access
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
      });

      res.json({
        success: true,
        data: {
          token,
          user: { id: 'legacy-admin', name: 'Admin', email: adminEmail, role: 'admin' },
        },
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Invalid credentials.',
    });
  } catch (err) {
    console.error('[auth/login]', err);
    res.status(500).json({
      success: false,
      message: 'Login failed.',
    });
  }
});

// ─── Public Signup ──────────────────────────────────────────────────────────
// Security fix: Rate limit signup to prevent abuse
router.post('/signup', authLimiter, async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    res.status(400).json({
      success: false,
      message: 'Name, email, and password are required.',
    });
    return;
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.',
    });
    return;
  }

  // Validate password length
  if (password.length < 8) {
    res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long.',
    });
    return;
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing user (case-insensitive)
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
      return;
    }

    // Create user — pre-save hook will hash the password automatically
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'viewer',
    });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({
        success: false,
        message: 'Server configuration error.',
      });
      return;
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, name: user.name, role: user.role },
      secret,
      { expiresIn: '24h' },
    );

    // Set cookie for browser-based access (e.g. diagnostic endpoints)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    console.error('[auth/signup]', err);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
    });
  }
});

// ─── Register (admin-only) ──────────────────────────────────────────────────
router.post('/register', protect, restrictTo('admin'), async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    const validRoles = ['admin', 'manager', 'viewer', 'user'];
    const assignedRole = validRoles.includes(role) ? role : 'viewer';

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ success: false, message: 'A user with this email already exists.' });
      return;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
    });

    // Apply referral code if provided (from body or query)
    const referralCode = req.body.referralCode || req.query.ref;
    if (referralCode && typeof referralCode === 'string') {
      try {
        await applyReferralCode(user._id.toString(), referralCode);
      } catch (refErr) {
        console.error('[auth/register] Failed to apply referral code:', refErr);
        // Don't fail registration if referral fails
      }
    }

    res.status(201).json({
      success: true,
      data: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

// ─── Get current user profile ───────────────────────────────────────────────
router.get('/me', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    // Try to find the user in DB for full info
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      res.json({
        success: true,
        data: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
      });
      return;
    }

    // Fallback to token data (for legacy env-var admin)
    res.json({
      success: true,
      data: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role },
    });
  } catch (err) {
    console.error('[auth/me]', err);
    res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
  }
});

// ─── List all users (admin-only) ────────────────────────────────────────────
router.get('/users', protect, restrictTo('admin'), async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      data: users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        createdAt: u.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ─── Change user role (admin-only) ──────────────────────────────────────────
router.patch('/users/:id/role', protect, restrictTo('admin'), async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role } = req.body;
    const validRoles = ['admin', 'manager', 'viewer', 'user'];

    if (!validRoles.includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role. Must be admin, manager, viewer, or user.' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true },
    ).select('-password');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.json({
      success: true,
      data: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
