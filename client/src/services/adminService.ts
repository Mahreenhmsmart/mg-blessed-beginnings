import apiClient from './apiClient';
import type {
  ApiResponse,
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
} from '@/types';

export const adminApiService = {
  // ─── Stats & Users ──────────────────────────────────────────────────────────

  async getStats(): Promise<AdminStats> {
    const response = await apiClient.get<ApiResponse<AdminStats>>('/admin-console/stats');
    return response.data.data!;
  },

  async getApiLogStats(): Promise<ApiLogStats> {
    const response = await apiClient.get<ApiResponse<ApiLogStats>>('/admin-console/logs/stats');
    return response.data.data!;
  },

  async getUsers(): Promise<AdminUser[]> {
    const response = await apiClient.get<ApiResponse<AdminUser[]>>('/admin-console/users');
    return response.data.data!;
  },

  async toggleUserStatus(userId: string): Promise<AdminUser> {
    const response = await apiClient.patch<ApiResponse<AdminUser>>(`/admin-console/users/${userId}/status`);
    return response.data.data!;
  },

  async updateUserRole(userId: string, role: string): Promise<AdminUser> {
    const response = await apiClient.patch<ApiResponse<AdminUser>>(`/admin-console/users/${userId}/role`, { role });
    return response.data.data!;
  },

  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/admin-console/users/${userId}`);
  },

  // ─── SEO Audits ─────────────────────────────────────────────────────────────

  async getAudits(params?: {
    limit?: number;
    offset?: number;
    status?: string;
    projectId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ audits: Audit[]; pagination: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.status) query.set('status', params.status);
    if (params?.projectId) query.set('projectId', params.projectId);
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.sortOrder) query.set('sortOrder', params.sortOrder);

    const response = await apiClient.get<ApiResponse<{ audits: Audit[]; pagination: PaginationMeta }>>(
      `/admin-console/audits?${query.toString()}`
    );
    return response.data.data!;
  },

  async deleteAudit(auditId: string): Promise<void> {
    await apiClient.delete(`/admin-console/audits/${auditId}`);
  },

  async bulkDeleteAudits(ids: string[]): Promise<{ deletedCount: number }> {
    const response = await apiClient.post<ApiResponse<{ deletedCount: number }>>(
      '/admin-console/audits/bulk-delete',
      { ids }
    );
    return response.data.data!;
  },

  // ─── GSC Connections ────────────────────────────────────────────────────────

  async getGSCConnections(params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ connections: GSCConnectionAdmin[]; pagination: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));

    const response = await apiClient.get<ApiResponse<{ connections: GSCConnectionAdmin[]; pagination: PaginationMeta }>>(
      `/admin-console/gsc-connections?${query.toString()}`
    );
    return response.data.data!;
  },

  async revokeGSCConnection(connectionId: string): Promise<void> {
    await apiClient.delete(`/admin-console/gsc-connections/${connectionId}`);
  },

  // ─── Security Scans ─────────────────────────────────────────────────────────

  async getSecurityScans(params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<{ scans: SecurityScanAdmin[]; pagination: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.status) query.set('status', params.status);

    const response = await apiClient.get<ApiResponse<{ scans: SecurityScanAdmin[]; pagination: PaginationMeta }>>(
      `/admin-console/security-scans?${query.toString()}`
    );
    return response.data.data!;
  },

  async getSecurityFindingsSummary(): Promise<SecurityFindingsSummary> {
    const response = await apiClient.get<ApiResponse<SecurityFindingsSummary>>(
      '/admin-console/security-scans/summary'
    );
    return response.data.data!;
  },

  // ─── Subscriptions ──────────────────────────────────────────────────────────

  async getSubscriptions(params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<{ subscriptions: SubscriptionAdmin[]; pagination: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.status) query.set('status', params.status);

    const response = await apiClient.get<ApiResponse<{ subscriptions: SubscriptionAdmin[]; pagination: PaginationMeta }>>(
      `/admin-console/subscriptions?${query.toString()}`
    );
    return response.data.data!;
  },

  async getSubscriptionStats(): Promise<SubscriptionStatsByStatus> {
    const response = await apiClient.get<ApiResponse<SubscriptionStatsByStatus>>(
      '/admin-console/subscriptions/stats'
    );
    return response.data.data!;
  },

  // ─── Referrals ──────────────────────────────────────────────────────────────

  async getReferrals(params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<{ referrals: ReferralAdmin[]; pagination: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.status) query.set('status', params.status);

    const response = await apiClient.get<ApiResponse<{ referrals: ReferralAdmin[]; pagination: PaginationMeta }>>(
      `/admin-console/referrals?${query.toString()}`
    );
    return response.data.data!;
  },

  async getReferralStats(): Promise<ReferralStats> {
    const response = await apiClient.get<ApiResponse<ReferralStats>>(
      '/admin-console/referrals/stats'
    );
    return response.data.data!;
  },

  // ─── Courses ────────────────────────────────────────────────────────────────

  async getCourses(params?: {
    limit?: number;
    offset?: number;
    status?: string;
    category?: string;
  }): Promise<{ courses: CourseAdmin[]; pagination: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.status) query.set('status', params.status);
    if (params?.category) query.set('category', params.category);

    const response = await apiClient.get<ApiResponse<{ courses: CourseAdmin[]; pagination: PaginationMeta }>>(
      `/admin-console/courses?${query.toString()}`
    );
    return response.data.data!;
  },

  async createCourse(data: CreateCourseInput): Promise<CourseAdmin> {
    const response = await apiClient.post<ApiResponse<CourseAdmin>>(
      '/admin-console/courses',
      data
    );
    return response.data.data!;
  },

  async updateCourse(courseId: string, data: Partial<CreateCourseInput>): Promise<CourseAdmin> {
    const response = await apiClient.patch<ApiResponse<CourseAdmin>>(
      `/admin-console/courses/${courseId}`,
      data
    );
    return response.data.data!;
  },

  async deleteCourse(courseId: string): Promise<void> {
    await apiClient.delete(`/admin-console/courses/${courseId}`);
  },

  // ─── Resources ──────────────────────────────────────────────────────────────

  async getResources(params?: {
    limit?: number;
    offset?: number;
    status?: string;
    type?: string;
  }): Promise<{ resources: ResourceAdmin[]; pagination: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.status) query.set('status', params.status);
    if (params?.type) query.set('type', params.type);

    const response = await apiClient.get<ApiResponse<{ resources: ResourceAdmin[]; pagination: PaginationMeta }>>(
      `/admin-console/resources?${query.toString()}`
    );
    return response.data.data!;
  },

  async createResource(data: CreateResourceInput): Promise<ResourceAdmin> {
    const response = await apiClient.post<ApiResponse<ResourceAdmin>>(
      '/admin-console/resources',
      data
    );
    return response.data.data!;
  },

  async updateResource(resourceId: string, data: Partial<CreateResourceInput>): Promise<ResourceAdmin> {
    const response = await apiClient.patch<ApiResponse<ResourceAdmin>>(
      `/admin-console/resources/${resourceId}`,
      data
    );
    return response.data.data!;
  },

  async deleteResource(resourceId: string): Promise<void> {
    await apiClient.delete(`/admin-console/resources/${resourceId}`);
  },

  // ─── AI Visibility Records ──────────────────────────────────────────────────

  async getAIVisibilityRecords(params?: {
    limit?: number;
    offset?: number;
    platform?: string;
    projectId?: string;
  }): Promise<{ records: AIVisibilityRecordAdmin[]; pagination: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.platform) query.set('platform', params.platform);
    if (params?.projectId) query.set('projectId', params.projectId);

    const response = await apiClient.get<ApiResponse<{ records: AIVisibilityRecordAdmin[]; pagination: PaginationMeta }>>(
      `/admin-console/ai-visibility?${query.toString()}`
    );
    return response.data.data!;
  },

  // ─── Competitor Audits ──────────────────────────────────────────────────────

  async getCompetitorAudits(params?: {
    limit?: number;
    offset?: number;
    status?: string;
    projectId?: string;
  }): Promise<{ audits: CompetitorAuditAdmin[]; pagination: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.status) query.set('status', params.status);
    if (params?.projectId) query.set('projectId', params.projectId);

    const response = await apiClient.get<ApiResponse<{ audits: CompetitorAuditAdmin[]; pagination: PaginationMeta }>>(
      `/admin-console/competitor-audits?${query.toString()}`
    );
    return response.data.data!;
  },

  // ─── Backlink Opportunities ─────────────────────────────────────────────────

  async getBacklinkOpportunities(params?: {
    limit?: number;
    offset?: number;
    status?: string;
    type?: string;
    projectId?: string;
  }): Promise<{ opportunities: BacklinkOpportunityAdmin[]; pagination: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.status) query.set('status', params.status);
    if (params?.type) query.set('type', params.type);
    if (params?.projectId) query.set('projectId', params.projectId);

    const response = await apiClient.get<ApiResponse<{ opportunities: BacklinkOpportunityAdmin[]; pagination: PaginationMeta }>>(
      `/admin-console/backlink-opportunities?${query.toString()}`
    );
    return response.data.data!;
  },

  async updateBacklinkOpportunity(
    opportunityId: string,
    data: Partial<{ status: string; domainAuthority: number }>
  ): Promise<BacklinkOpportunityAdmin> {
    const response = await apiClient.patch<ApiResponse<BacklinkOpportunityAdmin>>(
      `/admin-console/backlink-opportunities/${opportunityId}`,
      data
    );
    return response.data.data!;
  },

  // ─── Content Gaps ───────────────────────────────────────────────────────────

  async getContentGaps(params?: {
    limit?: number;
    offset?: number;
    priority?: string;
    projectId?: string;
  }): Promise<{ gaps: ContentGapAdmin[]; pagination: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.priority) query.set('priority', params.priority);
    if (params?.projectId) query.set('projectId', params.projectId);

    const response = await apiClient.get<ApiResponse<{ gaps: ContentGapAdmin[]; pagination: PaginationMeta }>>(
      `/admin-console/content-gaps?${query.toString()}`
    );
    return response.data.data!;
  },

  // ─── Keyword Gaps ───────────────────────────────────────────────────────────

  async getKeywordGaps(params?: {
    limit?: number;
    offset?: number;
    category?: string;
    intent?: string;
    projectId?: string;
  }): Promise<{ gaps: KeywordGapAdmin[]; pagination: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.category) query.set('category', params.category);
    if (params?.intent) query.set('intent', params.intent);
    if (params?.projectId) query.set('projectId', params.projectId);

    const response = await apiClient.get<ApiResponse<{ gaps: KeywordGapAdmin[]; pagination: PaginationMeta }>>(
      `/admin-console/keyword-gaps?${query.toString()}`
    );
    return response.data.data!;
  },

  // ─── Newsletter Subscribers ─────────────────────────────────────────────────

  async getNewsletterSubscribers(params?: {
    limit?: number;
    offset?: number;
    isActive?: boolean;
    source?: string;
  }): Promise<{ subscribers: NewsletterSubscriberAdmin[]; pagination: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.isActive !== undefined) query.set('isActive', String(params.isActive));
    if (params?.source) query.set('source', params.source);

    const response = await apiClient.get<ApiResponse<{ subscribers: NewsletterSubscriberAdmin[]; pagination: PaginationMeta }>>(
      `/admin-console/newsletter-subscribers?${query.toString()}`
    );
    return response.data.data!;
  },

  async updateNewsletterSubscriber(
    subscriberId: string,
    data: Partial<{ isActive: boolean; source: string }>
  ): Promise<NewsletterSubscriberAdmin> {
    const response = await apiClient.patch<ApiResponse<NewsletterSubscriberAdmin>>(
      `/admin-console/newsletter-subscribers/${subscriberId}`,
      data
    );
    return response.data.data!;
  },

  async deleteNewsletterSubscriber(subscriberId: string): Promise<void> {
    await apiClient.delete(`/admin-console/newsletter-subscribers/${subscriberId}`);
  },

  async exportNewsletterSubscribers(isActive?: boolean): Promise<Blob> {
    const query = new URLSearchParams();
    if (isActive !== undefined) query.set('isActive', String(isActive));

    const response = await apiClient.get(
      `/admin-console/newsletter-subscribers/export?${query.toString()}`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // ─── Pricing: Courses & Services ──────────────────────────────────────────────

  async getCoursesForPricing(): Promise<CourseAdmin[]> {
    const response = await apiClient.get<ApiResponse<CourseAdmin[]>>('/admin-console/pricing/courses');
    return response.data.data!;
  },

  async updateCoursePrice(courseId: string, price: number): Promise<CourseAdmin> {
    const response = await apiClient.put<ApiResponse<CourseAdmin>>(
      `/admin-console/pricing/courses/${courseId}`,
      { price }
    );
    return response.data.data!;
  },

  async getServicesForPricing(): Promise<ServiceAdmin[]> {
    const response = await apiClient.get<ApiResponse<ServiceAdmin[]>>('/admin-console/pricing/services');
    return response.data.data!;
  },

  async updateServicePrice(serviceId: string, price: string): Promise<ServiceAdmin> {
    const response = await apiClient.put<ApiResponse<ServiceAdmin>>(
      `/admin-console/pricing/services/${serviceId}`,
      { price }
    );
    return response.data.data!;
  },

  // ─── Portfolio ────────────────────────────────────────────────────────────────

  async getPortfolioItems(): Promise<PortfolioAdmin[]> {
    const response = await apiClient.get<ApiResponse<PortfolioAdmin[]>>('/admin-console/portfolio');
    return response.data.data!;
  },

  async createPortfolioItem(data: CreatePortfolioInput): Promise<PortfolioAdmin> {
    const response = await apiClient.post<ApiResponse<PortfolioAdmin>>('/admin-console/portfolio', data);
    return response.data.data!;
  },

  async updatePortfolioItem(id: string, data: Partial<CreatePortfolioInput>): Promise<PortfolioAdmin> {
    const response = await apiClient.put<ApiResponse<PortfolioAdmin>>(`/admin-console/portfolio/${id}`, data);
    return response.data.data!;
  },

  async deletePortfolioItem(id: string): Promise<void> {
    await apiClient.delete(`/admin-console/portfolio/${id}`);
  },

  // ─── Founder ──────────────────────────────────────────────────────────────────

  async getFounder(): Promise<FounderAdmin | null> {
    const response = await apiClient.get<ApiResponse<FounderAdmin | null>>('/admin-console/founder');
    return response.data.data!;
  },

  async upsertFounder(data: UpsertFounderInput): Promise<FounderAdmin> {
    const response = await apiClient.put<ApiResponse<FounderAdmin>>('/admin-console/founder', data);
    return response.data.data!;
  },

  // ─── Clones ───────────────────────────────────────────────────────────────────

  async getClones(): Promise<CloneAdmin[]> {
    const response = await apiClient.get<ApiResponse<CloneAdmin[]>>('/admin-console/clones');
    return response.data.data!;
  },

  async deleteClone(id: string): Promise<void> {
    await apiClient.delete(`/admin-console/clones/${id}`);
  },

  // ─── 30-Day Plan ──────────────────────────────────────────────────────────────

  async getThirtyDayPlans(): Promise<ThirtyDayPlanAdmin[]> {
    const response = await apiClient.get<ApiResponse<ThirtyDayPlanAdmin[]>>('/admin-console/thirtydayplan');
    return response.data.data!;
  },

  async createThirtyDayPlan(data: CreateThirtyDayPlanInput): Promise<ThirtyDayPlanAdmin> {
    const response = await apiClient.post<ApiResponse<ThirtyDayPlanAdmin>>('/admin-console/thirtydayplan', data);
    return response.data.data!;
  },

  async updateThirtyDayPlan(id: string, data: Partial<CreateThirtyDayPlanInput>): Promise<ThirtyDayPlanAdmin> {
    const response = await apiClient.put<ApiResponse<ThirtyDayPlanAdmin>>(`/admin-console/thirtydayplan/${id}`, data);
    return response.data.data!;
  },

  async deleteThirtyDayPlan(id: string): Promise<void> {
    await apiClient.delete(`/admin-console/thirtydayplan/${id}`);
  },

  // ─── Contact Messages ─────────────────────────────────────────────────────────

  async getContactMessages(): Promise<ContactMessageAdmin[]> {
    const response = await apiClient.get<ApiResponse<ContactMessageAdmin[]>>('/admin-console/contact-messages');
    return response.data.data!;
  },

  async deleteContactMessage(id: string): Promise<void> {
    await apiClient.delete(`/admin-console/contact-messages/${id}`);
  },
};
