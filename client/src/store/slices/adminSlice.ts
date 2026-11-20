import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApiService } from '../../services/adminService';
import type {
  AdminStats,
  ApiLogStats,
  AdminUser,
  Audit,
  GSCConnectionAdmin,
  SecurityScanAdmin,
  SecurityFindingsSummary,
  SubscriptionAdmin,
  SubscriptionStatsByStatus,
  ReferralAdmin,
  ReferralStats,
  CourseAdmin,
  CreateCourseInput,
  ResourceAdmin,
  CreateResourceInput,
  AIVisibilityRecordAdmin,
  CompetitorAuditAdmin,
  BacklinkOpportunityAdmin,
  ContentGapAdmin,
  KeywordGapAdmin,
  NewsletterSubscriberAdmin,
  PaginationMeta,
  ServiceAdmin,
  PortfolioAdmin,
  CreatePortfolioInput,
  FounderAdmin,
  UpsertFounderInput,
  CloneAdmin,
  ThirtyDayPlanAdmin,
  CreateThirtyDayPlanInput,
  ContactMessageAdmin,
} from '../../types';

interface AdminState {
  // Stats & Users
  stats: AdminStats | null;
  statsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  apiLogStats: ApiLogStats | null;
  apiLogStatsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  users: AdminUser[];
  usersStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // SEO Audits
  audits: Audit[];
  auditsPagination: PaginationMeta | null;
  auditsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // GSC Connections
  gscConnections: GSCConnectionAdmin[];
  gscConnectionsPagination: PaginationMeta | null;
  gscConnectionsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // Security Scans
  securityScans: SecurityScanAdmin[];
  securityScansPagination: PaginationMeta | null;
  securityScansStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  securityFindingsSummary: SecurityFindingsSummary | null;
  securityFindingsSummaryStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // Subscriptions
  subscriptions: SubscriptionAdmin[];
  subscriptionsPagination: PaginationMeta | null;
  subscriptionsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  subscriptionStats: SubscriptionStatsByStatus | null;
  subscriptionStatsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // Referrals
  referrals: ReferralAdmin[];
  referralsPagination: PaginationMeta | null;
  referralsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  referralStats: ReferralStats | null;
  referralStatsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // Courses
  courses: CourseAdmin[];
  coursesPagination: PaginationMeta | null;
  coursesStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // Resources
  resources: ResourceAdmin[];
  resourcesPagination: PaginationMeta | null;
  resourcesStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // AI Visibility Records
  aiVisibilityRecords: AIVisibilityRecordAdmin[];
  aiVisibilityPagination: PaginationMeta | null;
  aiVisibilityStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // Competitor Audits
  competitorAudits: CompetitorAuditAdmin[];
  competitorAuditsPagination: PaginationMeta | null;
  competitorAuditsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // Backlink Opportunities
  backlinkOpportunities: BacklinkOpportunityAdmin[];
  backlinkOpportunitiesPagination: PaginationMeta | null;
  backlinkOpportunitiesStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // Content Gaps
  contentGaps: ContentGapAdmin[];
  contentGapsPagination: PaginationMeta | null;
  contentGapsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // Keyword Gaps
  keywordGaps: KeywordGapAdmin[];
  keywordGapsPagination: PaginationMeta | null;
  keywordGapsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // Newsletter Subscribers
  newsletterSubscribers: NewsletterSubscriberAdmin[];
  newsletterSubscribersPagination: PaginationMeta | null;
  newsletterSubscribersStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // Pricing (Courses & Services for price editing)
  pricingCourses: CourseAdmin[];
  pricingCoursesStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  pricingServices: ServiceAdmin[];
  pricingServicesStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // Portfolio
  portfolioItems: PortfolioAdmin[];
  portfolioStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // Founder
  founder: FounderAdmin | null;
  founderStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // Clones
  clones: CloneAdmin[];
  clonesStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // 30-Day Plan
  thirtyDayPlans: ThirtyDayPlanAdmin[];
  thirtyDayPlansStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // Contact Messages
  contactMessages: ContactMessageAdmin[];
  contactMessagesStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  error: string | null;
}

const initialState: AdminState = {
  stats: null,
  statsStatus: 'idle',
  apiLogStats: null,
  apiLogStatsStatus: 'idle',
  users: [],
  usersStatus: 'idle',
  audits: [],
  auditsPagination: null,
  auditsStatus: 'idle',
  gscConnections: [],
  gscConnectionsPagination: null,
  gscConnectionsStatus: 'idle',
  securityScans: [],
  securityScansPagination: null,
  securityScansStatus: 'idle',
  securityFindingsSummary: null,
  securityFindingsSummaryStatus: 'idle',
  subscriptions: [],
  subscriptionsPagination: null,
  subscriptionsStatus: 'idle',
  subscriptionStats: null,
  subscriptionStatsStatus: 'idle',
  referrals: [],
  referralsPagination: null,
  referralsStatus: 'idle',
  referralStats: null,
  referralStatsStatus: 'idle',
  courses: [],
  coursesPagination: null,
  coursesStatus: 'idle',
  resources: [],
  resourcesPagination: null,
  resourcesStatus: 'idle',
  aiVisibilityRecords: [],
  aiVisibilityPagination: null,
  aiVisibilityStatus: 'idle',
  competitorAudits: [],
  competitorAuditsPagination: null,
  competitorAuditsStatus: 'idle',
  backlinkOpportunities: [],
  backlinkOpportunitiesPagination: null,
  backlinkOpportunitiesStatus: 'idle',
  contentGaps: [],
  contentGapsPagination: null,
  contentGapsStatus: 'idle',
  keywordGaps: [],
  keywordGapsPagination: null,
  keywordGapsStatus: 'idle',
  newsletterSubscribers: [],
  newsletterSubscribersPagination: null,
  newsletterSubscribersStatus: 'idle',
  pricingCourses: [],
  pricingCoursesStatus: 'idle',
  pricingServices: [],
  pricingServicesStatus: 'idle',
  portfolioItems: [],
  portfolioStatus: 'idle',
  founder: null,
  founderStatus: 'idle',
  clones: [],
  clonesStatus: 'idle',
  thirtyDayPlans: [],
  thirtyDayPlansStatus: 'idle',
  contactMessages: [],
  contactMessagesStatus: 'idle',
  error: null,
};

// ─── Async Thunks ──────────────────────────────────────────────────────────────

// Stats & Users
export const fetchAdminStats = createAsyncThunk('admin/fetchStats', async () => {
  return await adminApiService.getStats();
});

export const fetchApiLogStats = createAsyncThunk('admin/fetchApiLogStats', async () => {
  return await adminApiService.getApiLogStats();
});

export const fetchUsers = createAsyncThunk('admin/fetchUsers', async () => {
  return await adminApiService.getUsers();
});

export const toggleUserStatus = createAsyncThunk(
  'admin/toggleUserStatus',
  async (userId: string) => {
    return await adminApiService.toggleUserStatus(userId);
  }
);

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role }: { userId: string; role: string }) => {
    return await adminApiService.updateUserRole(userId, role);
  }
);

export const deleteUserThunk = createAsyncThunk(
  'admin/deleteUser',
  async (userId: string) => {
    await adminApiService.deleteUser(userId);
    return userId;
  }
);

// SEO Audits
export const fetchAudits = createAsyncThunk(
  'admin/fetchAudits',
  async (params?: { limit?: number; offset?: number; status?: string; projectId?: string }) => {
    return await adminApiService.getAudits(params);
  }
);

export const deleteAuditThunk = createAsyncThunk(
  'admin/deleteAudit',
  async (auditId: string) => {
    await adminApiService.deleteAudit(auditId);
    return auditId;
  }
);

export const bulkDeleteAuditsThunk = createAsyncThunk(
  'admin/bulkDeleteAudits',
  async (ids: string[]) => {
    const result = await adminApiService.bulkDeleteAudits(ids);
    return { ids, deletedCount: result.deletedCount };
  }
);

// GSC Connections
export const fetchGSCConnections = createAsyncThunk(
  'admin/fetchGSCConnections',
  async (params?: { limit?: number; offset?: number }) => {
    return await adminApiService.getGSCConnections(params);
  }
);

export const revokeGSCConnectionThunk = createAsyncThunk(
  'admin/revokeGSCConnection',
  async (connectionId: string) => {
    await adminApiService.revokeGSCConnection(connectionId);
    return connectionId;
  }
);

// Security Scans
export const fetchSecurityScans = createAsyncThunk(
  'admin/fetchSecurityScans',
  async (params?: { limit?: number; offset?: number; status?: string }) => {
    return await adminApiService.getSecurityScans(params);
  }
);

export const fetchSecurityFindingsSummary = createAsyncThunk(
  'admin/fetchSecurityFindingsSummary',
  async () => {
    return await adminApiService.getSecurityFindingsSummary();
  }
);

// Subscriptions
export const fetchSubscriptions = createAsyncThunk(
  'admin/fetchSubscriptions',
  async (params?: { limit?: number; offset?: number; status?: string }) => {
    return await adminApiService.getSubscriptions(params);
  }
);

export const fetchSubscriptionStats = createAsyncThunk(
  'admin/fetchSubscriptionStats',
  async () => {
    return await adminApiService.getSubscriptionStats();
  }
);

// Referrals
export const fetchReferrals = createAsyncThunk(
  'admin/fetchReferrals',
  async (params?: { limit?: number; offset?: number; status?: string }) => {
    return await adminApiService.getReferrals(params);
  }
);

export const fetchReferralStats = createAsyncThunk(
  'admin/fetchReferralStats',
  async () => {
    return await adminApiService.getReferralStats();
  }
);

// Courses
export const fetchCourses = createAsyncThunk(
  'admin/fetchCourses',
  async (params?: { limit?: number; offset?: number; status?: string; category?: string }) => {
    return await adminApiService.getCourses(params);
  }
);

export const createCourseThunk = createAsyncThunk(
  'admin/createCourse',
  async (data: CreateCourseInput) => {
    return await adminApiService.createCourse(data);
  }
);

export const updateCourseThunk = createAsyncThunk(
  'admin/updateCourse',
  async ({ courseId, data }: { courseId: string; data: Partial<CreateCourseInput> }) => {
    return await adminApiService.updateCourse(courseId, data);
  }
);

export const deleteCourseThunk = createAsyncThunk(
  'admin/deleteCourse',
  async (courseId: string) => {
    await adminApiService.deleteCourse(courseId);
    return courseId;
  }
);

// Resources
export const fetchResources = createAsyncThunk(
  'admin/fetchResources',
  async (params?: { limit?: number; offset?: number; status?: string; type?: string }) => {
    return await adminApiService.getResources(params);
  }
);

export const createResourceThunk = createAsyncThunk(
  'admin/createResource',
  async (data: CreateResourceInput) => {
    return await adminApiService.createResource(data);
  }
);

export const updateResourceThunk = createAsyncThunk(
  'admin/updateResource',
  async ({ resourceId, data }: { resourceId: string; data: Partial<CreateResourceInput> }) => {
    return await adminApiService.updateResource(resourceId, data);
  }
);

export const deleteResourceThunk = createAsyncThunk(
  'admin/deleteResource',
  async (resourceId: string) => {
    await adminApiService.deleteResource(resourceId);
    return resourceId;
  }
);

// AI Visibility Records
export const fetchAIVisibilityRecords = createAsyncThunk(
  'admin/fetchAIVisibilityRecords',
  async (params?: { limit?: number; offset?: number; platform?: string; projectId?: string }) => {
    return await adminApiService.getAIVisibilityRecords(params);
  }
);

// Competitor Audits
export const fetchCompetitorAudits = createAsyncThunk(
  'admin/fetchCompetitorAudits',
  async (params?: { limit?: number; offset?: number; status?: string; projectId?: string }) => {
    return await adminApiService.getCompetitorAudits(params);
  }
);

// Backlink Opportunities
export const fetchBacklinkOpportunities = createAsyncThunk(
  'admin/fetchBacklinkOpportunities',
  async (params?: { limit?: number; offset?: number; status?: string; type?: string; projectId?: string }) => {
    return await adminApiService.getBacklinkOpportunities(params);
  }
);

export const updateBacklinkOpportunityThunk = createAsyncThunk(
  'admin/updateBacklinkOpportunity',
  async ({ opportunityId, data }: { opportunityId: string; data: Partial<{ status: string; domainAuthority: number }> }) => {
    return await adminApiService.updateBacklinkOpportunity(opportunityId, data);
  }
);

// Content Gaps
export const fetchContentGaps = createAsyncThunk(
  'admin/fetchContentGaps',
  async (params?: { limit?: number; offset?: number; priority?: string; projectId?: string }) => {
    return await adminApiService.getContentGaps(params);
  }
);

// Keyword Gaps
export const fetchKeywordGaps = createAsyncThunk(
  'admin/fetchKeywordGaps',
  async (params?: { limit?: number; offset?: number; category?: string; intent?: string; projectId?: string }) => {
    return await adminApiService.getKeywordGaps(params);
  }
);

// Newsletter Subscribers
export const fetchNewsletterSubscribers = createAsyncThunk(
  'admin/fetchNewsletterSubscribers',
  async (params?: { limit?: number; offset?: number; isActive?: boolean; source?: string }) => {
    return await adminApiService.getNewsletterSubscribers(params);
  }
);

export const updateNewsletterSubscriberThunk = createAsyncThunk(
  'admin/updateNewsletterSubscriber',
  async ({ subscriberId, data }: { subscriberId: string; data: Partial<{ isActive: boolean; source: string }> }) => {
    return await adminApiService.updateNewsletterSubscriber(subscriberId, data);
  }
);

export const deleteNewsletterSubscriberThunk = createAsyncThunk(
  'admin/deleteNewsletterSubscriber',
  async (subscriberId: string) => {
    await adminApiService.deleteNewsletterSubscriber(subscriberId);
    return subscriberId;
  }
);

// ─── Slice ─────────────────────────────────────────────────────────────────────

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    resetAdminState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchAdminStats.pending, (state) => {
        state.statsStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.statsStatus = 'succeeded';
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.statsStatus = 'failed';
        state.error = action.error.message || 'Failed to fetch stats';
      })
      // API Log Stats
      .addCase(fetchApiLogStats.pending, (state) => {
        state.apiLogStatsStatus = 'loading';
      })
      .addCase(fetchApiLogStats.fulfilled, (state, action) => {
        state.apiLogStatsStatus = 'succeeded';
        state.apiLogStats = action.payload;
      })
      .addCase(fetchApiLogStats.rejected, (state, action) => {
        state.apiLogStatsStatus = 'failed';
        state.error = action.error.message || 'Failed to fetch API log stats';
      })
      // Users
      .addCase(fetchUsers.pending, (state) => {
        state.usersStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersStatus = 'succeeded';
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersStatus = 'failed';
        state.error = action.error.message || 'Failed to fetch users';
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.users.findIndex((u) => u._id === updated._id);
        if (idx !== -1) state.users[idx] = updated;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.users.findIndex((u) => u._id === updated._id);
        if (idx !== -1) state.users[idx] = updated;
      })
      .addCase(deleteUserThunk.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      })
      // Audits
      .addCase(fetchAudits.pending, (state) => {
        state.auditsStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchAudits.fulfilled, (state, action) => {
        state.auditsStatus = 'succeeded';
        state.audits = action.payload.audits;
        state.auditsPagination = action.payload.pagination;
      })
      .addCase(fetchAudits.rejected, (state, action) => {
        state.auditsStatus = 'failed';
        state.error = action.error.message || 'Failed to fetch audits';
      })
      .addCase(deleteAuditThunk.fulfilled, (state, action) => {
        state.audits = state.audits.filter((a) => a._id !== action.payload);
      })
      .addCase(bulkDeleteAuditsThunk.fulfilled, (state, action) => {
        const deletedIds = new Set(action.payload.ids);
        state.audits = state.audits.filter((a) => !deletedIds.has(a._id));
      })
      // GSC Connections
      .addCase(fetchGSCConnections.pending, (state) => {
        state.gscConnectionsStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchGSCConnections.fulfilled, (state, action) => {
        state.gscConnectionsStatus = 'succeeded';
        state.gscConnections = action.payload.connections;
        state.gscConnectionsPagination = action.payload.pagination;
      })
      .addCase(fetchGSCConnections.rejected, (state, action) => {
        state.gscConnectionsStatus = 'failed';
        state.error = action.error.message || 'Failed to fetch GSC connections';
      })
      .addCase(revokeGSCConnectionThunk.fulfilled, (state, action) => {
        state.gscConnections = state.gscConnections.filter((c) => c._id !== action.payload);
      })
      // Security Scans
      .addCase(fetchSecurityScans.pending, (state) => {
        state.securityScansStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchSecurityScans.fulfilled, (state, action) => {
        state.securityScansStatus = 'succeeded';
        state.securityScans = action.payload.scans;
        state.securityScansPagination = action.payload.pagination;
      })
      .addCase(fetchSecurityScans.rejected, (state, action) => {
        state.securityScansStatus = 'failed';
        state.error = action.error.message || 'Failed to fetch security scans';
      })
      .addCase(fetchSecurityFindingsSummary.pending, (state) => {
        state.securityFindingsSummaryStatus = 'loading';
      })
      .addCase(fetchSecurityFindingsSummary.fulfilled, (state, action) => {
        state.securityFindingsSummaryStatus = 'succeeded';
        state.securityFindingsSummary = action.payload;
      })
      .addCase(fetchSecurityFindingsSummary.rejected, (state, action) => {
        state.securityFindingsSummaryStatus = 'failed';
        state.error = action.error.message || 'Failed to fetch security findings summary';
      })
      // Subscriptions
      .addCase(fetchSubscriptions.pending, (state) => {
        state.subscriptionsStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.subscriptionsStatus = 'succeeded';
        state.subscriptions = action.payload.subscriptions;
        state.subscriptionsPagination = action.payload.pagination;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.subscriptionsStatus = 'failed';
        state.error = action.error.message || 'Failed to fetch subscriptions';
      })
      .addCase(fetchSubscriptionStats.pending, (state) => {
        state.subscriptionStatsStatus = 'loading';
      })
      .addCase(fetchSubscriptionStats.fulfilled, (state, action) => {
        state.subscriptionStatsStatus = 'succeeded';
        state.subscriptionStats = action.payload;
      })
      .addCase(fetchSubscriptionStats.rejected, (state, action) => {
        state.subscriptionStatsStatus = 'failed';
        state.error = action.error.message || 'Failed to fetch subscription stats';
      })
      // Referrals
      .addCase(fetchReferrals.pending, (state) => {
        state.referralsStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchReferrals.fulfilled, (state, action) => {
        state.referralsStatus = 'succeeded';
        state.referrals = action.payload.referrals;
        state.referralsPagination = action.payload.pagination;
      })
      .addCase(fetchReferrals.rejected, (state, action) => {
        state.referralsStatus = 'failed';
        state.error = action.error.message || 'Failed to fetch referrals';
      })
      .addCase(fetchReferralStats.pending, (state) => {
        state.referralStatsStatus = 'loading';
      })
      .addCase(fetchReferralStats.fulfilled, (state, action) => {
        state.referralStatsStatus = 'succeeded';
        state.referralStats = action.payload;
      })
      .addCase(fetchReferralStats.rejected, (state, action) => {
        state.referralStatsStatus = 'failed';
        state.error = action.error.message || 'Failed to fetch referral stats';
      })
      // Courses
      .addCase(fetchCourses.pending, (state) => {
        state.coursesStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.coursesStatus = 'succeeded';
        state.courses = action.payload.courses;
        state.coursesPagination = action.payload.pagination;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.coursesStatus = 'failed';
        state.error = action.error.message || 'Failed to fetch courses';
      })
      .addCase(createCourseThunk.fulfilled, (state, action) => {
        state.courses.unshift(action.payload);
      })
      .addCase(updateCourseThunk.fulfilled, (state, action) => {
        const idx = state.courses.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.courses[idx] = action.payload;
      })
      .addCase(deleteCourseThunk.fulfilled, (state, action) => {
        state.courses = state.courses.filter((c) => c._id !== action.payload);
      })
      // Resources
      .addCase(fetchResources.pending, (state) => {
        state.resourcesStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.resourcesStatus = 'succeeded';
        state.resources = action.payload.resources;
        state.resourcesPagination = action.payload.pagination;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.resourcesStatus = 'failed';
        state.error = action.error.message || 'Failed to fetch resources';
      })
      .addCase(createResourceThunk.fulfilled, (state, action) => {
        state.resources.unshift(action.payload);
      })
      .addCase(updateResourceThunk.fulfilled, (state, action) => {
        const idx = state.resources.findIndex((r) => r._id === action.payload._id);
        if (idx !== -1) state.resources[idx] = action.payload;
      })
      .addCase(deleteResourceThunk.fulfilled, (state, action) => {
        state.resources = state.resources.filter((r) => r._id !== action.payload);
      })
      // AI Visibility Records
      .addCase(fetchAIVisibilityRecords.pending, (state) => {
        state.aiVisibilityStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchAIVisibilityRecords.fulfilled, (state, action) => {
        state.aiVisibilityStatus = 'succeeded';
        state.aiVisibilityRecords = action.payload.records;
        state.aiVisibilityPagination = action.payload.pagination;
      })
      .addCase(fetchAIVisibilityRecords.rejected, (state, action) => {
        state.aiVisibilityStatus = 'failed';
        state.error = action.error.message || 'Failed to fetch AI visibility records';
      })
      // Competitor Audits
      .addCase(fetchCompetitorAudits.pending, (state) => {
        state.competitorAuditsStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchCompetitorAudits.fulfilled, (state, action) => {
        state.competitorAuditsStatus = 'succeeded';
        state.competitorAudits = action.payload.audits;
        state.competitorAuditsPagination = action.payload.pagination;
      })
      .addCase(fetchCompetitorAudits.rejected, (state, action) => {
        state.competitorAuditsStatus = 'failed';
        state.error = action.error.message || 'Failed to fetch competitor audits';
      })
      // Backlink Opportunities
      .addCase(fetchBacklinkOpportunities.pending, (state) => {
        state.backlinkOpportunitiesStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchBacklinkOpportunities.fulfilled, (state, action) => {
        state.backlinkOpportunitiesStatus = 'succeeded';
        state.backlinkOpportunities = action.payload.opportunities;
        state.backlinkOpportunitiesPagination = action.payload.pagination;
      })
      .addCase(fetchBacklinkOpportunities.rejected, (state, action) => {
        state.backlinkOpportunitiesStatus = 'failed';
        state.error = action.error.message || 'Failed to fetch backlink opportunities';
      })
      .addCase(updateBacklinkOpportunityThunk.fulfilled, (state, action) => {
        const idx = state.backlinkOpportunities.findIndex((o) => o._id === action.payload._id);
        if (idx !== -1) state.backlinkOpportunities[idx] = action.payload;
      })
      // Content Gaps
      .addCase(fetchContentGaps.pending, (state) => {
        state.contentGapsStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchContentGaps.fulfilled, (state, action) => {
        state.contentGapsStatus = 'succeeded';
        state.contentGaps = action.payload.gaps;
        state.contentGapsPagination = action.payload.pagination;
      })
      .addCase(fetchContentGaps.rejected, (state, action) => {
        state.contentGapsStatus = 'failed';
        state.error = action.error.message || 'Failed to fetch content gaps';
      })
      // Keyword Gaps
      .addCase(fetchKeywordGaps.pending, (state) => {
        state.keywordGapsStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchKeywordGaps.fulfilled, (state, action) => {
        state.keywordGapsStatus = 'succeeded';
        state.keywordGaps = action.payload.gaps;
        state.keywordGapsPagination = action.payload.pagination;
      })
      .addCase(fetchKeywordGaps.rejected, (state, action) => {
        state.keywordGapsStatus = 'failed';
        state.error = action.error.message || 'Failed to fetch keyword gaps';
      })
      // Newsletter Subscribers
      .addCase(fetchNewsletterSubscribers.pending, (state) => {
        state.newsletterSubscribersStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchNewsletterSubscribers.fulfilled, (state, action) => {
        state.newsletterSubscribersStatus = 'succeeded';
        state.newsletterSubscribers = action.payload.subscribers;
        state.newsletterSubscribersPagination = action.payload.pagination;
      })
      .addCase(fetchNewsletterSubscribers.rejected, (state, action) => {
        state.newsletterSubscribersStatus = 'failed';
        state.error = action.error.message || 'Failed to fetch newsletter subscribers';
      })
      .addCase(updateNewsletterSubscriberThunk.fulfilled, (state, action) => {
        const idx = state.newsletterSubscribers.findIndex((s) => s._id === action.payload._id);
        if (idx !== -1) state.newsletterSubscribers[idx] = action.payload;
      })
      .addCase(deleteNewsletterSubscriberThunk.fulfilled, (state, action) => {
        state.newsletterSubscribers = state.newsletterSubscribers.filter((s) => s._id !== action.payload);
      });
  },
});

export const { resetAdminState } = adminSlice.actions;
export default adminSlice.reducer;
