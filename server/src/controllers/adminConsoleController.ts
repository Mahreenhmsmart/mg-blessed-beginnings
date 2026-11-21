/**
 * Admin Console Controller
 *
 * Handles admin-only endpoints for the Admin Console dashboard:
 * - Aggregate stats across all entities
 * - User management (list, toggle status, change role)
 * - API log stats from the console logger ring buffer
 * - SEO Audits management
 * - GSC Connections management
 * - Security Scans management
 * - Subscriptions management
 * - Payments management
 * - Referrals management
 * - Courses management
 * - Resources management
 * - AI Visibility Records management
 * - Competitor Audits management
 * - Backlink Opportunities management
 * - Content Gaps & Keyword Gaps management
 * - Newsletter Subscribers management
 */

import type { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import type { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Project from '../models/Project';
import BlogPost from '../models/BlogPost';
import Service from '../models/Service';
import Consultation from '../models/Consultation';
import ContactMessage from '../models/ContactMessage';
import AITool from '../models/AITool';
import Audit from '../models/Audit';
import GSCConnection from '../models/GSCConnection';
import SecurityScan from '../models/SecurityScan';
import Subscription from '../models/Subscription';
import Referral from '../models/Referral';
import Course from '../models/Course';
import Resource from '../models/Resource';
import AIVisibilityRecord from '../models/AIVisibilityRecord';
import CompetitorAudit from '../models/CompetitorAudit';
import BacklinkOpportunity from '../models/BacklinkOpportunity';
import ContentGap from '../models/ContentGap';
import KeywordGap from '../models/KeywordGap';
import NewsletterSubscriber from '../models/NewsletterSubscriber';
import Product from '../models/Product';
import Portfolio from '../models/Portfolio';
import Founder from '../models/Founder';
import Clone from '../models/Clone';
import ThirtyDayPlan from '../models/ThirtyDayPlan';
import HomepageSettings from '../models/HomepageSettings';
import { getLogBuffer } from '../middleware/consoleLogger';

// ─── Admin Stats ───────────────────────────────────────────────────────────────

export async function getAdminStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const [
      totalUsers,
      totalProjects,
      totalAudits,
      totalServices,
      totalBlogPosts,
      totalConsultations,
      totalContacts,
      totalGSCConnections,
      totalSecurityScans,
      totalSubscriptions,
      activeSubscriptions,
      totalReferrals,
      totalCourses,
      totalResources,
      totalNewsletterSubscribers,
      totalAIVisibilityRecords,
      totalCompetitorAudits,
      totalBacklinkOpportunities,
      totalContentGaps,
      totalKeywordGaps,
    ] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Audit.countDocuments(),
      Service.countDocuments(),
      BlogPost.countDocuments(),
      Consultation.countDocuments(),
      ContactMessage.countDocuments(),
      GSCConnection.countDocuments(),
      SecurityScan.countDocuments(),
      Subscription.countDocuments(),
      Subscription.countDocuments({ status: 'active' }),
      Referral.countDocuments(),
      Course.countDocuments(),
      Resource.countDocuments(),
      NewsletterSubscriber.countDocuments({ isActive: true }),
      AIVisibilityRecord.countDocuments(),
      CompetitorAudit.countDocuments(),
      BacklinkOpportunity.countDocuments(),
      ContentGap.countDocuments(),
      KeywordGap.countDocuments(),
    ]);

    // Get security findings breakdown
    const securityFindings = await SecurityScan.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          critical: { $sum: '$findingsCount.critical' },
          high: { $sum: '$findingsCount.high' },
          medium: { $sum: '$findingsCount.medium' },
          low: { $sum: '$findingsCount.low' },
          informational: { $sum: '$findingsCount.informational' },
        },
      },
    ]);

    const findingsBreakdown = securityFindings[0] || {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      informational: 0,
    };

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProjects,
        totalAudits,
        totalServices,
        totalBlogPosts,
        totalConsultations,
        totalContacts,
        totalGSCConnections,
        totalSecurityScans,
        totalSubscriptions,
        activeSubscriptions,
        totalReferrals,
        totalCourses,
        totalResources,
        totalNewsletterSubscribers,
        totalAIVisibilityRecords,
        totalCompetitorAudits,
        totalBacklinkOpportunities,
        totalContentGaps,
        totalKeywordGaps,
        securityFindings: findingsBreakdown,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── User Management ──────────────────────────────────────────────────────────

export async function getAllUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

export async function toggleUserStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid user ID', statusCode: 400 });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found', statusCode: 404 });
      return;
    }

    // Prevent deactivating yourself
    if (req.user && req.user.id === id) {
      res.status(400).json({ success: false, error: 'Cannot toggle your own status', statusCode: 400 });
      return;
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    const updated = await User.findById(id).select('-password').lean();
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid user ID', statusCode: 400 });
      return;
    }

    if (!role || !['admin', 'manager', 'viewer', 'user'].includes(role)) {
      res.status(400).json({ success: false, error: 'Valid role is required (admin, manager, viewer, user)', statusCode: 400 });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found', statusCode: 404 });
      return;
    }

    // Prevent changing your own role
    if (req.user && req.user.id === id) {
      res.status(400).json({ success: false, error: 'Cannot change your own role', statusCode: 400 });
      return;
    }

    user.role = role;
    await user.save({ validateBeforeSave: false });

    const updated = await User.findById(id).select('-password').lean();
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid user ID', statusCode: 400 });
      return;
    }

    // Prevent deleting yourself
    if (req.user && req.user.id === id) {
      res.status(400).json({ success: false, error: 'Cannot delete your own account', statusCode: 400 });
      return;
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found', statusCode: 404 });
      return;
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// ─── API Log Stats ─────────────────────────────────────────────────────────────

export function getApiLogStats(_req: AuthRequest, res: Response): void {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  // Filter entries from the last hour
  const recentLogs = getLogBuffer().filter((entry) => entry.timestamp.getTime() >= oneHourAgo);

  const requestCount = recentLogs.length;
  const errorCount = recentLogs.filter((e) => e.status >= 500).length;
  const warningCount = recentLogs.filter((e) => e.status >= 400 && e.status < 500).length;
  const errorRate = requestCount > 0 ? Number(((errorCount / requestCount) * 100).toFixed(2)) : 0;

  const totalDuration = recentLogs.reduce((sum, e) => sum + e.durationMs, 0);
  const avgResponseTime = requestCount > 0 ? Math.round(totalDuration / requestCount) : 0;

  // Group by path for slowest endpoints
  const endpointMap = new Map<string, { totalMs: number; count: number }>();
  for (const entry of recentLogs) {
    // Normalize URL by removing query strings and IDs
    const normalizedPath = entry.url.split('?')[0].replace(/\/[a-f0-9]{24}/g, '/:id');
    const existing = endpointMap.get(normalizedPath) || { totalMs: 0, count: 0 };
    existing.totalMs += entry.durationMs;
    existing.count += 1;
    endpointMap.set(normalizedPath, existing);
  }

  const slowestEndpoints = Array.from(endpointMap.entries())
    .map(([path, data]) => ({
      path,
      avgMs: Math.round(data.totalMs / data.count),
      count: data.count,
    }))
    .sort((a, b) => b.avgMs - a.avgMs)
    .slice(0, 10);

  res.json({
    success: true,
    data: {
      requestCount,
      errorCount,
      warningCount,
      errorRate,
      avgResponseTime,
      slowestEndpoints,
    },
  });
}

// ─── SEO Audits Management ──────────────────────────────────────────────────────

export async function getAllAudits(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { limit = '20', offset = '0', status, projectId, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const lim = Math.min(parseInt(limit as string, 10) || 20, 100);
    const off = parseInt(offset as string, 10) || 0;

    const filter: Record<string, unknown> = {};
    if (status && ['queued', 'running', 'completed', 'failed'].includes(status as string)) {
      filter.status = status;
    }
    if (projectId && mongoose.Types.ObjectId.isValid(projectId as string)) {
      filter.projectId = projectId;
    }

    const [audits, total] = await Promise.all([
      Audit.find(filter)
        .populate('projectId', 'name url')
        .sort({ [sortBy as string]: sortOrder === 'asc' ? 1 : -1 })
        .skip(off)
        .limit(lim)
        .lean(),
      Audit.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        audits,
        pagination: {
          total,
          limit: lim,
          offset: off,
          hasMore: off + lim < total,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAudit(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid audit ID', statusCode: 400 });
      return;
    }

    const audit = await Audit.findByIdAndDelete(id);
    if (!audit) {
      res.status(404).json({ success: false, error: 'Audit not found', statusCode: 404 });
      return;
    }

    res.json({ success: true, message: 'Audit deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function bulkDeleteAudits(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ success: false, error: 'IDs array is required', statusCode: 400 });
      return;
    }

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      res.status(400).json({ success: false, error: 'No valid IDs provided', statusCode: 400 });
      return;
    }

    const result = await Audit.deleteMany({ _id: { $in: validIds } });

    res.json({
      success: true,
      data: { deletedCount: result.deletedCount },
      message: `${result.deletedCount} audits deleted`,
    });
  } catch (err) {
    next(err);
  }
}

// ─── GSC Connections Management ─────────────────────────────────────────────────

export async function getAllGSCConnections(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { limit = '20', offset = '0' } = req.query;
    const lim = Math.min(parseInt(limit as string, 10) || 20, 100);
    const off = parseInt(offset as string, 10) || 0;

    const [connections, total] = await Promise.all([
      GSCConnection.find()
        .populate('projectId', 'name url userId')
        .select('-accessToken -refreshToken') // Never expose tokens
        .sort({ connectedAt: -1 })
        .skip(off)
        .limit(lim)
        .lean(),
      GSCConnection.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        connections,
        pagination: {
          total,
          limit: lim,
          offset: off,
          hasMore: off + lim < total,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function revokeGSCConnection(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid connection ID', statusCode: 400 });
      return;
    }

    const connection = await GSCConnection.findByIdAndDelete(id);
    if (!connection) {
      res.status(404).json({ success: false, error: 'Connection not found', statusCode: 404 });
      return;
    }

    res.json({ success: true, message: 'GSC connection revoked successfully' });
  } catch (err) {
    next(err);
  }
}

// ─── Security Scans Management ──────────────────────────────────────────────────

export async function getAllSecurityScans(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { limit = '20', offset = '0', status, severity } = req.query;
    const lim = Math.min(parseInt(limit as string, 10) || 20, 100);
    const off = parseInt(offset as string, 10) || 0;

    const filter: Record<string, unknown> = {};
    if (status) {
      filter.status = status;
    }

    const [scans, total] = await Promise.all([
      SecurityScan.find(filter)
        .populate('userId', 'name email')
        .select('-reportContent') // Don't send full report content in list
        .sort({ createdAt: -1 })
        .skip(off)
        .limit(lim)
        .lean(),
      SecurityScan.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        scans,
        pagination: {
          total,
          limit: lim,
          offset: off,
          hasMore: off + lim < total,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getSecurityFindingsSummary(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const summary = await SecurityScan.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalScans: { $sum: 1 },
          avgScore: { $avg: '$score' },
          criticalTotal: { $sum: '$findingsCount.critical' },
          highTotal: { $sum: '$findingsCount.high' },
          mediumTotal: { $sum: '$findingsCount.medium' },
          lowTotal: { $sum: '$findingsCount.low' },
          infoTotal: { $sum: '$findingsCount.informational' },
        },
      },
    ]);

    res.json({
      success: true,
      data: summary[0] || {
        totalScans: 0,
        avgScore: 0,
        criticalTotal: 0,
        highTotal: 0,
        mediumTotal: 0,
        lowTotal: 0,
        infoTotal: 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Subscriptions Management ───────────────────────────────────────────────────

export async function getAllSubscriptions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { limit = '20', offset = '0', status } = req.query;
    const lim = Math.min(parseInt(limit as string, 10) || 20, 100);
    const off = parseInt(offset as string, 10) || 0;

    const filter: Record<string, unknown> = {};
    if (status && ['active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'paused'].includes(status as string)) {
      filter.status = status;
    }

    const [subscriptions, total] = await Promise.all([
      Subscription.find(filter)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(off)
        .limit(lim)
        .lean(),
      Subscription.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        subscriptions,
        pagination: {
          total,
          limit: lim,
          offset: off,
          hasMore: off + lim < total,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getSubscriptionStats(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await Subscription.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts: Record<string, number> = {};
    stats.forEach((s) => {
      statusCounts[s._id] = s.count;
    });

    res.json({
      success: true,
      data: {
        byStatus: statusCounts,
        total: Object.values(statusCounts).reduce((a, b) => a + b, 0),
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Referrals Management ───────────────────────────────────────────────────────

export async function getAllReferrals(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { limit = '20', offset = '0', status } = req.query;
    const lim = Math.min(parseInt(limit as string, 10) || 20, 100);
    const off = parseInt(offset as string, 10) || 0;

    const filter: Record<string, unknown> = {};
    if (status && ['pending', 'completed'].includes(status as string)) {
      filter.status = status;
    }

    const [referrals, total] = await Promise.all([
      Referral.find(filter)
        .populate('referrer', 'name email')
        .populate('referred', 'name email')
        .sort({ createdAt: -1 })
        .skip(off)
        .limit(lim)
        .lean(),
      Referral.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        referrals,
        pagination: {
          total,
          limit: lim,
          offset: off,
          hasMore: off + lim < total,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getReferralStats(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await Referral.aggregate([
      {
        $group: {
          _id: null,
          totalReferrals: { $sum: 1 },
          totalCreditsAwarded: { $sum: '$creditsAwarded' },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalReferrals: 0,
        totalCreditsAwarded: 0,
        pendingCount: 0,
        completedCount: 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Courses Management ─────────────────────────────────────────────────────────

export async function getAllCourses(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { limit = '20', offset = '0', status, category } = req.query;
    const lim = Math.min(parseInt(limit as string, 10) || 20, 100);
    const off = parseInt(offset as string, 10) || 0;

    const filter: Record<string, unknown> = {};
    if (status && ['draft', 'published'].includes(status as string)) {
      filter.status = status;
    }
    if (category) {
      filter.category = category;
    }

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .sort({ createdAt: -1 })
        .skip(off)
        .limit(lim)
        .lean(),
      Course.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          total,
          limit: lim,
          offset: off,
          hasMore: off + lim < total,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const courseData = req.body;

    if (!courseData.title || !courseData.slug || !courseData.description) {
      res.status(400).json({
        success: false,
        error: 'Title, slug, and description are required',
        statusCode: 400,
      });
      return;
    }

    const existing = await Course.findOne({ slug: courseData.slug });
    if (existing) {
      res.status(409).json({
        success: false,
        error: 'A course with this slug already exists',
        statusCode: 409,
      });
      return;
    }

    const course = await Course.create(courseData);

    res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid course ID', statusCode: 400 });
      return;
    }

    const course = await Course.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!course) {
      res.status(404).json({ success: false, error: 'Course not found', statusCode: 404 });
      return;
    }

    res.json({
      success: true,
      data: course,
      message: 'Course updated successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid course ID', statusCode: 400 });
      return;
    }

    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      res.status(404).json({ success: false, error: 'Course not found', statusCode: 404 });
      return;
    }

    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// ─── Resources Management ───────────────────────────────────────────────────────

export async function getAllResources(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { limit = '20', offset = '0', status, type } = req.query;
    const lim = Math.min(parseInt(limit as string, 10) || 20, 100);
    const off = parseInt(offset as string, 10) || 0;

    const filter: Record<string, unknown> = {};
    if (status && ['draft', 'published'].includes(status as string)) {
      filter.status = status;
    }
    if (type && ['guide', 'template', 'checklist', 'ebook', 'worksheet'].includes(type as string)) {
      filter.type = type;
    }

    const [resources, total] = await Promise.all([
      Resource.find(filter)
        .sort({ createdAt: -1 })
        .skip(off)
        .limit(lim)
        .lean(),
      Resource.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        resources,
        pagination: {
          total,
          limit: lim,
          offset: off,
          hasMore: off + lim < total,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createResource(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const resourceData = req.body;

    if (!resourceData.title || !resourceData.slug || !resourceData.downloadUrl) {
      res.status(400).json({
        success: false,
        error: 'Title, slug, and download URL are required',
        statusCode: 400,
      });
      return;
    }

    const existing = await Resource.findOne({ slug: resourceData.slug });
    if (existing) {
      res.status(409).json({
        success: false,
        error: 'A resource with this slug already exists',
        statusCode: 409,
      });
      return;
    }

    const resource = await Resource.create(resourceData);

    res.status(201).json({
      success: true,
      data: resource,
      message: 'Resource created successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function updateResource(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid resource ID', statusCode: 400 });
      return;
    }

    const resource = await Resource.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!resource) {
      res.status(404).json({ success: false, error: 'Resource not found', statusCode: 404 });
      return;
    }

    res.json({
      success: true,
      data: resource,
      message: 'Resource updated successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteResource(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid resource ID', statusCode: 400 });
      return;
    }

    const resource = await Resource.findByIdAndDelete(id);
    if (!resource) {
      res.status(404).json({ success: false, error: 'Resource not found', statusCode: 404 });
      return;
    }

    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// ─── AI Visibility Records Management ───────────────────────────────────────────

export async function getAllAIVisibilityRecords(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { limit = '20', offset = '0', platform, projectId } = req.query;
    const lim = Math.min(parseInt(limit as string, 10) || 20, 100);
    const off = parseInt(offset as string, 10) || 0;

    const filter: Record<string, unknown> = {};
    if (platform && ['ChatGPT', 'Perplexity', 'Gemini', 'Google-SGE'].includes(platform as string)) {
      filter.platform = platform;
    }
    if (projectId && mongoose.Types.ObjectId.isValid(projectId as string)) {
      filter.projectId = projectId;
    }

    const [records, total] = await Promise.all([
      AIVisibilityRecord.find(filter)
        .populate('projectId', 'name url')
        .sort({ checkedAt: -1 })
        .skip(off)
        .limit(lim)
        .lean(),
      AIVisibilityRecord.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        records,
        pagination: {
          total,
          limit: lim,
          offset: off,
          hasMore: off + lim < total,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Competitor Audits Management ───────────────────────────────────────────────

export async function getAllCompetitorAudits(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { limit = '20', offset = '0', status, projectId } = req.query;
    const lim = Math.min(parseInt(limit as string, 10) || 20, 100);
    const off = parseInt(offset as string, 10) || 0;

    const filter: Record<string, unknown> = {};
    if (status && ['queued', 'running', 'completed', 'failed'].includes(status as string)) {
      filter.status = status;
    }
    if (projectId && mongoose.Types.ObjectId.isValid(projectId as string)) {
      filter.projectId = projectId;
    }

    const [audits, total] = await Promise.all([
      CompetitorAudit.find(filter)
        .populate('projectId', 'name url')
        .sort({ createdAt: -1 })
        .skip(off)
        .limit(lim)
        .lean(),
      CompetitorAudit.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        audits,
        pagination: {
          total,
          limit: lim,
          offset: off,
          hasMore: off + lim < total,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Backlink Opportunities Management ──────────────────────────────────────────

export async function getAllBacklinkOpportunities(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { limit = '20', offset = '0', status, type, projectId } = req.query;
    const lim = Math.min(parseInt(limit as string, 10) || 20, 100);
    const off = parseInt(offset as string, 10) || 0;

    const filter: Record<string, unknown> = {};
    if (status && ['discovered', 'contacted', 'acquired'].includes(status as string)) {
      filter.status = status;
    }
    if (type && ['competitor-referral', 'broken-link', 'unlinked-mention', 'guest-post'].includes(type as string)) {
      filter.type = type;
    }
    if (projectId && mongoose.Types.ObjectId.isValid(projectId as string)) {
      filter.projectId = projectId;
    }

    const [opportunities, total] = await Promise.all([
      BacklinkOpportunity.find(filter)
        .populate('projectId', 'name url')
        .sort({ createdAt: -1 })
        .skip(off)
        .limit(lim)
        .lean(),
      BacklinkOpportunity.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        opportunities,
        pagination: {
          total,
          limit: lim,
          offset: off,
          hasMore: off + lim < total,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateBacklinkOpportunity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid opportunity ID', statusCode: 400 });
      return;
    }

    const opportunity = await BacklinkOpportunity.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!opportunity) {
      res.status(404).json({ success: false, error: 'Opportunity not found', statusCode: 404 });
      return;
    }

    res.json({
      success: true,
      data: opportunity,
      message: 'Opportunity updated successfully',
    });
  } catch (err) {
    next(err);
  }
}

// ─── Content Gaps Management ────────────────────────────────────────────────────

export async function getAllContentGaps(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { limit = '20', offset = '0', priority, projectId } = req.query;
    const lim = Math.min(parseInt(limit as string, 10) || 20, 100);
    const off = parseInt(offset as string, 10) || 0;

    const filter: Record<string, unknown> = {};
    if (priority && ['high', 'medium', 'low'].includes(priority as string)) {
      filter.priority = priority;
    }
    if (projectId && mongoose.Types.ObjectId.isValid(projectId as string)) {
      filter.projectId = projectId;
    }

    const [gaps, total] = await Promise.all([
      ContentGap.find(filter)
        .populate('projectId', 'name url')
        .sort({ createdAt: -1 })
        .skip(off)
        .limit(lim)
        .lean(),
      ContentGap.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        gaps,
        pagination: {
          total,
          limit: lim,
          offset: off,
          hasMore: off + lim < total,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Keyword Gaps Management ────────────────────────────────────────────────────

export async function getAllKeywordGaps(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { limit = '20', offset = '0', category, intent, projectId } = req.query;
    const lim = Math.min(parseInt(limit as string, 10) || 20, 100);
    const off = parseInt(offset as string, 10) || 0;

    const filter: Record<string, unknown> = {};
    if (category) {
      filter.category = category;
    }
    if (intent) {
      filter.intent = intent;
    }
    if (projectId && mongoose.Types.ObjectId.isValid(projectId as string)) {
      filter.projectId = projectId;
    }

    const [gaps, total] = await Promise.all([
      KeywordGap.find(filter)
        .populate('projectId', 'name url')
        .sort({ opportunity: -1 })
        .skip(off)
        .limit(lim)
        .lean(),
      KeywordGap.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        gaps,
        pagination: {
          total,
          limit: lim,
          offset: off,
          hasMore: off + lim < total,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Newsletter Subscribers Management ──────────────────────────────────────────

export async function getAllNewsletterSubscribers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { limit = '20', offset = '0', isActive, source } = req.query;
    const lim = Math.min(parseInt(limit as string, 10) || 20, 100);
    const off = parseInt(offset as string, 10) || 0;

    const filter: Record<string, unknown> = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    if (source) {
      filter.source = source;
    }

    const [subscribers, total] = await Promise.all([
      NewsletterSubscriber.find(filter)
        .sort({ createdAt: -1 })
        .skip(off)
        .limit(lim)
        .lean(),
      NewsletterSubscriber.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        subscribers,
        pagination: {
          total,
          limit: lim,
          offset: off,
          hasMore: off + lim < total,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateNewsletterSubscriber(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid subscriber ID', statusCode: 400 });
      return;
    }

    const subscriber = await NewsletterSubscriber.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!subscriber) {
      res.status(404).json({ success: false, error: 'Subscriber not found', statusCode: 404 });
      return;
    }

    res.json({
      success: true,
      data: subscriber,
      message: 'Subscriber updated successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteNewsletterSubscriber(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid subscriber ID', statusCode: 400 });
      return;
    }

    const subscriber = await NewsletterSubscriber.findByIdAndDelete(id);
    if (!subscriber) {
      res.status(404).json({ success: false, error: 'Subscriber not found', statusCode: 404 });
      return;
    }

    res.json({ success: true, message: 'Subscriber deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function exportNewsletterSubscribers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { isActive } = req.query;

    const filter: Record<string, unknown> = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const subscribers = await NewsletterSubscriber.find(filter)
      .select('email source isActive createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Convert to CSV format
    const csvHeader = 'Email,Source,Active,Subscribed Date\n';
    const csvRows = subscribers.map((s) => {
      const createdAt = (s as any).createdAt || new Date();
      return `"${s.email}","${s.source || ''}",${s.isActive},"${new Date(createdAt).toISOString()}"`;
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="newsletter-subscribers.csv"');
    res.send(csvHeader + csvRows);
  } catch (err) {
    next(err);
  }
}

// ─── Shop Products ─────────────────────────────────────────────────────────────

export async function getAllProducts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const products = await Product.find().sort({ createdAt: 1 }).lean();
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { title, price, buyUrl, description, image, category } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid product ID', statusCode: 400 });
      return;
    }

    const updateFields: Record<string, unknown> = {};
    if (title !== undefined) updateFields.title = title;
    if (price !== undefined) updateFields.price = price;
    if (buyUrl !== undefined) updateFields.buyUrl = buyUrl;
    if (description !== undefined) updateFields.description = description;
    if (image !== undefined) updateFields.image = image;
    if (category !== undefined) updateFields.category = category;

    const product = await Product.findByIdAndUpdate(id, { $set: updateFields }, { new: true, runValidators: true }).lean();

    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found', statusCode: 404 });
      return;
    }

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, price, description, image, category, buyUrl } = req.body;

    if (!title || !price) {
      res.status(400).json({ success: false, error: 'Title and price are required', statusCode: 400 });
      return;
    }

    const product = await Product.create({
      title,
      price,
      description: description || '',
      image: image || '',
      category: category || '',
      buyUrl: buyUrl || '',
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid product ID', statusCode: 400 });
      return;
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found', statusCode: 404 });
      return;
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// ─── Homepage Settings ────────────────────────────────────────────────────────

export async function getHomepageSettings(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    let settings = await HomepageSettings.findOne().lean();
    if (!settings) {
      // Seed with defaults on first read
      const created = await HomepageSettings.create({});
      settings = await HomepageSettings.findById(created._id).lean();
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
}

export async function updateHomepageSettings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const updates = req.body;

    // Ensure a document exists
    let settings = await HomepageSettings.findOne();
    if (!settings) {
      settings = await HomepageSettings.create({});
    }

    // Apply partial updates to each section
    if (updates.hero) {
      settings.set('hero', { ...settings.get('hero'), ...updates.hero });
    }
    if (updates.contentHook) {
      settings.set('contentHook', { ...settings.get('contentHook'), ...updates.contentHook });
    }
    if (updates.journeySteps && Array.isArray(updates.journeySteps)) {
      settings.journeySteps = updates.journeySteps;
    }
    if (updates.aiReadinessPreview) {
      settings.set('aiReadinessPreview', { ...settings.get('aiReadinessPreview'), ...updates.aiReadinessPreview });
    }
    if (updates.adSlots && Array.isArray(updates.adSlots)) {
      settings.adSlots = updates.adSlots;
    }

    await settings.save();
    const updated = await HomepageSettings.findById(settings._id).lean();
    res.json({ success: true, data: updated, message: 'Homepage settings updated successfully' });
  } catch (err) {
    next(err);
  }
}

// ─── Pricing: Course Price Update ──────────────────────────────────────────────

export async function getAllCoursesForPricing(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const courses = await Course.find()
      .select('title price slug category level status')
      .sort({ title: 1 })
      .lean();
    res.json({ success: true, data: courses });
  } catch (err) {
    next(err);
  }
}

export async function updateCoursePrice(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { price } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid course ID', statusCode: 400 });
      return;
    }

    if (price === undefined || typeof price !== 'number' || price < 0) {
      res.status(400).json({ success: false, error: 'Valid price (number >= 0) is required', statusCode: 400 });
      return;
    }

    const course = await Course.findByIdAndUpdate(
      id,
      { $set: { price } },
      { new: true, runValidators: true },
    ).select('title price slug category level status').lean();

    if (!course) {
      res.status(404).json({ success: false, error: 'Course not found', statusCode: 404 });
      return;
    }

    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
}

// ─── Pricing: Service Price Update ─────────────────────────────────────────────

export async function getAllServicesForPricing(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const services = await Service.find()
      .select('title price slug order')
      .sort({ order: 1 })
      .lean();
    res.json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
}

export async function updateServicePrice(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { price } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid service ID', statusCode: 400 });
      return;
    }

    if (price === undefined || typeof price !== 'string' || !price.trim()) {
      res.status(400).json({ success: false, error: 'Valid price string is required', statusCode: 400 });
      return;
    }

    const service = await Service.findByIdAndUpdate(
      id,
      { $set: { price: price.trim() } },
      { new: true, runValidators: true },
    ).select('title price slug order').lean();

    if (!service) {
      res.status(404).json({ success: false, error: 'Service not found', statusCode: 404 });
      return;
    }

    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
}

// ─── Portfolio Management ──────────────────────────────────────────────────────

export async function getAllPortfolioItems(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await Portfolio.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

export async function createPortfolioItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, description, imageUrl, projectUrl, category } = req.body;

    if (!title || !description || !category) {
      res.status(400).json({ success: false, error: 'Title, description, and category are required', statusCode: 400 });
      return;
    }

    const item = await Portfolio.create({ title, description, imageUrl: imageUrl || '', projectUrl: projectUrl || '', category });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function updatePortfolioItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid portfolio ID', statusCode: 400 });
      return;
    }

    const item = await Portfolio.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).lean();
    if (!item) {
      res.status(404).json({ success: false, error: 'Portfolio item not found', statusCode: 404 });
      return;
    }

    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function deletePortfolioItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid portfolio ID', statusCode: 400 });
      return;
    }

    const item = await Portfolio.findByIdAndDelete(id);
    if (!item) {
      res.status(404).json({ success: false, error: 'Portfolio item not found', statusCode: 404 });
      return;
    }

    res.json({ success: true, message: 'Portfolio item deleted' });
  } catch (err) {
    next(err);
  }
}

// ─── Founder (Single Document) ─────────────────────────────────────────────────

export async function getFounder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const founder = await Founder.findOne().lean();
    res.json({ success: true, data: founder });
  } catch (err) {
    next(err);
  }
}

export async function upsertFounder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, photo, bio, title, socialLinks } = req.body;

    if (!name || !bio || !title) {
      res.status(400).json({ success: false, error: 'Name, bio, and title are required', statusCode: 400 });
      return;
    }

    const updateData: Record<string, unknown> = { name, bio, title };
    if (photo !== undefined) updateData.photo = photo;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;

    const founder = await Founder.findOneAndUpdate(
      {},
      { $set: updateData },
      { upsert: true, new: true, runValidators: true },
    ).lean();

    res.json({ success: true, data: founder });
  } catch (err) {
    next(err);
  }
}

// ─── Clone Records ─────────────────────────────────────────────────────────────

export async function getAllClones(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const clones = await Clone.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: clones });
  } catch (err) {
    next(err);
  }
}

export async function deleteClone(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid clone ID', statusCode: 400 });
      return;
    }

    const clone = await Clone.findByIdAndDelete(id);
    if (!clone) {
      res.status(404).json({ success: false, error: 'Clone record not found', statusCode: 404 });
      return;
    }

    res.json({ success: true, message: 'Clone record deleted' });
  } catch (err) {
    next(err);
  }
}

// ─── 30-Day Plan Management ────────────────────────────────────────────────────

export async function getAllThirtyDayPlans(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const plans = await ThirtyDayPlan.find().sort({ dayNumber: 1 }).lean();
    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
}

export async function createThirtyDayPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { dayNumber, title, description, tasks, resources } = req.body;

    if (dayNumber === undefined || !title || !description) {
      res.status(400).json({ success: false, error: 'Day number, title, and description are required', statusCode: 400 });
      return;
    }

    const existing = await ThirtyDayPlan.findOne({ dayNumber });
    if (existing) {
      res.status(409).json({ success: false, error: `Day ${dayNumber} already exists`, statusCode: 409 });
      return;
    }

    const plan = await ThirtyDayPlan.create({
      dayNumber,
      title,
      description,
      tasks: tasks || [],
      resources: resources || [],
    });

    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
}

export async function updateThirtyDayPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid plan ID', statusCode: 400 });
      return;
    }

    const plan = await ThirtyDayPlan.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).lean();
    if (!plan) {
      res.status(404).json({ success: false, error: 'Plan not found', statusCode: 404 });
      return;
    }

    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
}

export async function deleteThirtyDayPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid plan ID', statusCode: 400 });
      return;
    }

    const plan = await ThirtyDayPlan.findByIdAndDelete(id);
    if (!plan) {
      res.status(404).json({ success: false, error: 'Plan not found', statusCode: 404 });
      return;
    }

    res.json({ success: true, message: 'Plan deleted' });
  } catch (err) {
    next(err);
  }
}

// ─── Contact Messages ──────────────────────────────────────────────────────────

export async function getAllContactMessages(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
}

export async function deleteContactMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid message ID', statusCode: 400 });
      return;
    }

    const message = await ContactMessage.findByIdAndDelete(id);
    if (!message) {
      res.status(404).json({ success: false, error: 'Contact message not found', statusCode: 404 });
      return;
    }

    res.json({ success: true, message: 'Contact message deleted' });
  } catch (err) {
    next(err);
  }
}
