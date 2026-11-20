/**
 * Admin Console Routes
 *
 * All endpoints are protected with `protect` + `restrictTo('admin')`.
 * Mounted at /api/admin-console in app.ts.
 */

import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  getAdminStats,
  getAllUsers,
  toggleUserStatus,
  updateUserRole,
  deleteUser,
  getApiLogStats,
  // SEO Audits
  getAllAudits,
  deleteAudit,
  bulkDeleteAudits,
  // GSC Connections
  getAllGSCConnections,
  revokeGSCConnection,
  // Security Scans
  getAllSecurityScans,
  getSecurityFindingsSummary,
  // Subscriptions
  getAllSubscriptions,
  getSubscriptionStats,
  // Referrals
  getAllReferrals,
  getReferralStats,
  // Courses
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  // Resources
  getAllResources,
  createResource,
  updateResource,
  deleteResource,
  // AI Visibility
  getAllAIVisibilityRecords,
  // Competitor Audits
  getAllCompetitorAudits,
  // Backlink Opportunities
  getAllBacklinkOpportunities,
  updateBacklinkOpportunity,
  // Content Gaps
  getAllContentGaps,
  // Keyword Gaps
  getAllKeywordGaps,
  // Newsletter
  getAllNewsletterSubscribers,
  updateNewsletterSubscriber,
  deleteNewsletterSubscriber,
  exportNewsletterSubscribers,
  // Shop Products
  getAllProducts,
  updateProduct,
  // Homepage Settings
  getHomepageSettings,
  updateHomepageSettings,
  // Pricing (Courses & Services)
  getAllCoursesForPricing,
  updateCoursePrice,
  getAllServicesForPricing,
  updateServicePrice,
  // Portfolio
  getAllPortfolioItems,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  // Founder
  getFounder,
  upsertFounder,
  // Clones
  getAllClones,
  deleteClone,
  // 30-Day Plan
  getAllThirtyDayPlans,
  createThirtyDayPlan,
  updateThirtyDayPlan,
  deleteThirtyDayPlan,
  // Contact Messages
  getAllContactMessages,
  deleteContactMessage,
} from '../controllers/adminConsoleController';

const router = Router();

// All routes require authentication AND admin role
router.use(protect);
router.use(restrictTo('admin'));

// Stats & monitoring
router.get('/stats', getAdminStats);
router.get('/logs/stats', getApiLogStats);

// User management
router.get('/users', getAllUsers);
router.patch('/users/:id/status', toggleUserStatus);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// SEO Audits management
router.get('/audits', getAllAudits);
router.delete('/audits/:id', deleteAudit);
router.post('/audits/bulk-delete', bulkDeleteAudits);

// GSC Connections management
router.get('/gsc-connections', getAllGSCConnections);
router.delete('/gsc-connections/:id', revokeGSCConnection);

// Security Scans management
router.get('/security-scans', getAllSecurityScans);
router.get('/security-scans/summary', getSecurityFindingsSummary);

// Subscriptions management
router.get('/subscriptions', getAllSubscriptions);
router.get('/subscriptions/stats', getSubscriptionStats);

// Referrals management
router.get('/referrals', getAllReferrals);
router.get('/referrals/stats', getReferralStats);

// Courses management (CRUD)
router.get('/courses', getAllCourses);
router.post('/courses', createCourse);
router.patch('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// Resources management (CRUD)
router.get('/resources', getAllResources);
router.post('/resources', createResource);
router.patch('/resources/:id', updateResource);
router.delete('/resources/:id', deleteResource);

// AI Visibility Records
router.get('/ai-visibility', getAllAIVisibilityRecords);

// Competitor Audits
router.get('/competitor-audits', getAllCompetitorAudits);

// Backlink Opportunities
router.get('/backlink-opportunities', getAllBacklinkOpportunities);
router.patch('/backlink-opportunities/:id', updateBacklinkOpportunity);

// Content Gaps
router.get('/content-gaps', getAllContentGaps);

// Keyword Gaps
router.get('/keyword-gaps', getAllKeywordGaps);

// Newsletter Subscribers
router.get('/newsletter-subscribers', getAllNewsletterSubscribers);
router.get('/newsletter-subscribers/export', exportNewsletterSubscribers);
router.patch('/newsletter-subscribers/:id', updateNewsletterSubscriber);
router.delete('/newsletter-subscribers/:id', deleteNewsletterSubscriber);

// Shop Products
router.get('/products', getAllProducts);
router.put('/products/:id', updateProduct);

// Homepage Settings
router.get('/homepage-settings', getHomepageSettings);
router.put('/homepage-settings', updateHomepageSettings);

// Pricing — Courses & Services (price-only editing)
router.get('/pricing/courses', getAllCoursesForPricing);
router.put('/pricing/courses/:id', updateCoursePrice);
router.get('/pricing/services', getAllServicesForPricing);
router.put('/pricing/services/:id', updateServicePrice);

// Portfolio CRUD
router.get('/portfolio', getAllPortfolioItems);
router.post('/portfolio', createPortfolioItem);
router.put('/portfolio/:id', updatePortfolioItem);
router.delete('/portfolio/:id', deletePortfolioItem);

// Founder (single-document upsert)
router.get('/founder', getFounder);
router.put('/founder', upsertFounder);

// Clone Records (list + delete only)
router.get('/clones', getAllClones);
router.delete('/clones/:id', deleteClone);

// 30-Day Plan CRUD
router.get('/thirtydayplan', getAllThirtyDayPlans);
router.post('/thirtydayplan', createThirtyDayPlan);
router.put('/thirtydayplan/:id', updateThirtyDayPlan);
router.delete('/thirtydayplan/:id', deleteThirtyDayPlan);

// Contact Messages (list + delete only)
router.get('/contact-messages', getAllContactMessages);
router.delete('/contact-messages/:id', deleteContactMessage);

export default router;
