import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  FolderOpen,
  CalendarClock,
  Mail,
  Sparkles,
  Activity,
  Settings as SettingsIcon,
  Search,
  Trash2,
  Shield,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  CreditCard,
  Link as LinkIcon,
  BookOpen,
  Download,
  Gift,
  Globe,
  Target,
  Newspaper,
  Key,
  ExternalLink,
  Plus,
  Edit,
  Filter,
  Video,
  Star,
  DollarSign,
  Copy,
  UserCircle,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button, Card, Badge, Spinner, Modal, Input, Field, EmptyState, Alert } from '@/components/ui';
import Pagination from '@/components/ui/Pagination';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import {
  fetchAdminStats,
  fetchApiLogStats,
  fetchUsers,
  toggleUserStatus,
  updateUserRole,
  deleteUserThunk,
  fetchAudits,
  deleteAuditThunk,
  bulkDeleteAuditsThunk,
  fetchGSCConnections,
  revokeGSCConnectionThunk,
  fetchSecurityScans,
  fetchSecurityFindingsSummary,
  fetchSubscriptions,
  fetchSubscriptionStats,
  fetchReferrals,
  fetchReferralStats,
  fetchCourses,
  createCourseThunk,
  updateCourseThunk,
  deleteCourseThunk,
  fetchResources,
  createResourceThunk,
  updateResourceThunk,
  deleteResourceThunk,
  fetchAIVisibilityRecords,
  fetchCompetitorAudits,
  fetchBacklinkOpportunities,
  updateBacklinkOpportunityThunk,
  fetchContentGaps,
  fetchKeywordGaps,
  fetchNewsletterSubscribers,
  updateNewsletterSubscriberThunk,
  deleteNewsletterSubscriberThunk,
} from '@/store/slices/adminSlice';
import { adminApiService } from '@/services/adminService';
import apiClient from '@/services/apiClient';
import PagesEditor from '@/components/admin/PagesEditor';
import DashboardPricing from './DashboardPricing';
import DashboardCloneWebsite from './DashboardCloneWebsite';
import DashboardContact from './DashboardContact';
import type {
  ApiResponse,
  Service,
  BlogPost,
  Project,
  Consultation,
  ContactMessage,
  AITool,
  AdminUser,
  Audit,
  GSCConnectionAdmin,
  SecurityScanAdmin,
  SubscriptionAdmin,
  ReferralAdmin,
  CourseAdmin,
  ResourceAdmin,
  AIVisibilityRecordAdmin,
  CompetitorAuditAdmin,
  BacklinkOpportunityAdmin,
  ContentGapAdmin,
  KeywordGapAdmin,
  NewsletterSubscriberAdmin,
  CreateCourseInput,
  CreateResourceInput,
  ContactMessageAdmin,
  PortfolioAdmin,
  CreatePortfolioInput,
  FounderAdmin,
  UpsertFounderInput,
  CloneAdmin,
  ThirtyDayPlanAdmin,
  CreateThirtyDayPlanInput,
  ServiceAdmin,
} from '@/types';

// ─── Tab Definitions ──────────────────────────────────────────────────────────

type TabId =
  | 'overview'
  | 'users'
  | 'audits'
  | 'gsc-connections'
  | 'security'
  | 'services'
  | 'subscriptions'
  | 'blog'
  | 'courses'
  | 'resources'
  | 'projects'
  | 'referrals'
  | 'ai-visibility'
  | 'competitor-audits'
  | 'backlinks'
  | 'content-gaps'
  | 'keyword-gaps'
  | 'consultations'
  | 'contacts'
  | 'newsletter'
  | 'ai-tools'
  | 'videos'
  | 'pages'
  | 'pricing'
  | 'portfolio'
  | 'about-founder'
  | 'clone-website'
  | 'thirty-day-plan'
  | 'reviews'
  | 'api-monitor'
  | 'settings';

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabDef[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'audits', label: 'SEO Audits', icon: Search },
  { id: 'gsc-connections', label: 'GSC', icon: LinkIcon },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'services', label: 'Services', icon: Briefcase },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'blog', label: 'Blog', icon: FileText },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'resources', label: 'Resources', icon: Download },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'referrals', label: 'Referrals', icon: Gift },
  { id: 'ai-visibility', label: 'AI Visibility', icon: Globe },
  { id: 'competitor-audits', label: 'Competitors', icon: Target },
  { id: 'backlinks', label: 'Backlinks', icon: ExternalLink },
  { id: 'content-gaps', label: 'Content Gaps', icon: FileText },
  { id: 'keyword-gaps', label: 'Keywords', icon: Key },
  { id: 'consultations', label: 'Consultations', icon: CalendarClock },
  { id: 'contacts', label: 'Messages', icon: Mail },
  { id: 'newsletter', label: 'Newsletter & Notifications', icon: Newspaper },
  { id: 'ai-tools', label: 'AI Tools', icon: Sparkles },
  { id: 'videos', label: 'Videos', icon: Video },
  { id: 'pages', label: 'Pages', icon: FileText },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'portfolio', label: 'Portfolio', icon: FolderOpen },
  { id: 'about-founder', label: 'About/Founder', icon: UserCircle },
  { id: 'clone-website', label: 'Clone a Website', icon: Copy },
  { id: 'thirty-day-plan', label: '30-Day Plan', icon: CalendarClock },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'api-monitor', label: 'API Monitor', icon: Activity },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminConsole() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const dispatch = useAppDispatch();
  const adminState = useAppSelector((s: RootState) => s.admin);
  const { stats, statsStatus, apiLogStats, apiLogStatsStatus, users, usersStatus } = adminState;
  // Load stats on mount
  useEffect(() => {
    if (statsStatus === 'idle') dispatch(fetchAdminStats());
  }, [dispatch, statsStatus]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return (
        <OverviewTab
          stats={stats}
          statsStatus={statsStatus}
          onNavigate={setActiveTab}
          data-icod-id="src_pages_dashboard_adminconsole_tsx_8bc2" />
      );
      case 'users': return (
        <UsersTab
          users={users}
          usersStatus={usersStatus}
          data-icod-id="src_pages_dashboard_adminconsole_tsx_d221" />
      );
      case 'audits': return <SEOAuditsTab data-icod-id="src_pages_dashboard_adminconsole_tsx_7876" />;
      case 'gsc-connections': return <GSCConnectionsTab data-icod-id="src_pages_dashboard_adminconsole_tsx_b10f" />;
      case 'security': return <SecurityTab data-icod-id="src_pages_dashboard_adminconsole_tsx_4a53" />;
      case 'services': return <ServicesTab data-icod-id="src_pages_dashboard_adminconsole_tsx_1678" />;
      case 'subscriptions': return <SubscriptionsTab data-icod-id="src_pages_dashboard_adminconsole_tsx_5d3d" />;
      case 'blog': return <BlogTab data-icod-id="src_pages_dashboard_adminconsole_tsx_7846" />;
      case 'courses': return <CoursesTab data-icod-id="src_pages_dashboard_adminconsole_tsx_9b6c" />;
      case 'resources': return <ResourcesTab data-icod-id="src_pages_dashboard_adminconsole_tsx_82bd" />;
      case 'projects': return <ProjectsTab data-icod-id="src_pages_dashboard_adminconsole_tsx_3e5b" />;
      case 'referrals': return <ReferralsTab data-icod-id="src_pages_dashboard_adminconsole_tsx_60ff" />;
      case 'ai-visibility': return <AIVisibilityTab data-icod-id="src_pages_dashboard_adminconsole_tsx_fe10" />;
      case 'competitor-audits': return <CompetitorAuditsTab data-icod-id="src_pages_dashboard_adminconsole_tsx_e737" />;
      case 'backlinks': return <BacklinkOpportunitiesTab data-icod-id="src_pages_dashboard_adminconsole_tsx_13e5" />;
      case 'content-gaps': return <ContentGapsTab data-icod-id="src_pages_dashboard_adminconsole_tsx_9f0b" />;
      case 'keyword-gaps': return <KeywordGapsTab data-icod-id="src_pages_dashboard_adminconsole_tsx_d9e0" />;
      case 'consultations': return <ConsultationsTab data-icod-id="src_pages_dashboard_adminconsole_tsx_6ef4" />;
      case 'contacts': return <DashboardContact data-icod-id="src_pages_dashboard_adminconsole_tsx_7ed7" />;
      case 'newsletter': return <NewsletterTab data-icod-id="src_pages_dashboard_adminconsole_tsx_6273" />;
      case 'ai-tools': return <AIToolsTab data-icod-id="src_pages_dashboard_adminconsole_tsx_0b9a" />;
      case 'videos': return <VideosTab data-icod-id="admin_videos_tab" />;
      case 'pages': return <PagesEditor data-icod-id="admin_pages_tab" />;
      case 'api-monitor': return (
        <ApiMonitorTab
          apiLogStats={apiLogStats}
          apiLogStatsStatus={apiLogStatsStatus}
          data-icod-id="src_pages_dashboard_adminconsole_tsx_f6d8" />
      );
      case 'pricing': return <DashboardPricing data-icod-id="admin_pricing_tab" />;
      case 'portfolio': return <PortfolioTab data-icod-id="admin_portfolio_tab" />;
      case 'about-founder': return <AboutFounderTab data-icod-id="admin_founder_tab" />;
      case 'clone-website': return <DashboardCloneWebsite data-icod-id="admin_clone_tab" />;
      case 'thirty-day-plan': return <ThirtyDayPlanTab data-icod-id="admin_thirtydayplan_tab" />;
      case 'reviews': return <ReviewsTab data-icod-id="admin_reviews_tab" />;
      case 'settings': return <SettingsTab data-icod-id="src_pages_dashboard_adminconsole_tsx_6dc3" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-6" data-icod-id="admin_console_root">
      {/* Page Header */}
      <div className="flex items-center justify-between" data-icod-id="admin_console_header">
        <div className="flex items-center gap-3" data-icod-id="admin_console_header_left">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden" data-icod-id="admin_console_icon_wrap">
            <img
              src="https://drive.google.com/thumbnail?id=17_eHHL7Lgz4XxCm2NlcyhqW4PLEFUTxr&sz=w1920"
              alt="MG"
              className="h-full w-full object-contain"
              data-icod-id="admin_console_logo_img" />
          </div>
          <div data-icod-id="admin_console_title_block">
            <h1 className="font-heading text-2xl font-bold text-foreground" data-icod-id="admin_console_title">Admin Console</h1>
            <p className="text-sm text-muted-foreground" data-icod-id="admin_console_subtitle">Manage all platform sections from one place</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="overflow-x-auto border-b border-border" data-icod-id="admin_console_tabs_nav">
        <div className="flex min-w-max gap-1 px-1" data-icod-id="admin_console_tabs_list">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
                  'border-b-2 whitespace-nowrap',
                  active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
                )}
                data-icod-id={`admin_console_tab_${tab.id}`}>
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]" data-icod-id="admin_console_content">
        {renderTabContent()}
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  stats,
  statsStatus,
  onNavigate,
}: {
  stats: RootState['admin']['stats'];
  statsStatus: string;
  onNavigate: (tab: TabId) => void;
}) {
  if (statsStatus === 'loading') {
    return <div className="flex justify-center py-12" data-icod-id="admin_overview_loading"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_9ab9" /></div>;
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-primary', tab: 'users' as TabId },
    { label: 'Projects', value: stats?.totalProjects ?? 0, icon: FolderOpen, color: 'text-accent-foreground', tab: 'projects' as TabId },
    { label: 'SEO Audits', value: stats?.totalAudits ?? 0, icon: Search, color: 'text-success', tab: 'audits' as TabId },
    { label: 'GSC Connections', value: stats?.totalGSCConnections ?? 0, icon: LinkIcon, color: 'text-primary', tab: 'gsc-connections' as TabId },
    { label: 'Security Scans', value: stats?.totalSecurityScans ?? 0, icon: Shield, color: 'text-warning', tab: 'security' as TabId },
    { label: 'Services', value: stats?.totalServices ?? 0, icon: Briefcase, color: 'text-accent-foreground', tab: 'services' as TabId },
    { label: 'Subscriptions', value: stats?.totalSubscriptions ?? 0, icon: CreditCard, color: 'text-success', tab: 'subscriptions' as TabId },
    { label: 'Active Subs', value: stats?.activeSubscriptions ?? 0, icon: CheckCircle2, color: 'text-success', tab: 'subscriptions' as TabId },
    { label: 'Blog Posts', value: stats?.totalBlogPosts ?? 0, icon: FileText, color: 'text-primary', tab: 'blog' as TabId },
    { label: 'Courses', value: stats?.totalCourses ?? 0, icon: BookOpen, color: 'text-accent-foreground', tab: 'courses' as TabId },
    { label: 'Resources', value: stats?.totalResources ?? 0, icon: Download, color: 'text-primary', tab: 'resources' as TabId },
    { label: 'Referrals', value: stats?.totalReferrals ?? 0, icon: Gift, color: 'text-success', tab: 'referrals' as TabId },
    { label: 'Newsletter', value: stats?.totalNewsletterSubscribers ?? 0, icon: Newspaper, color: 'text-accent-foreground', tab: 'newsletter' as TabId },
    { label: 'Consultations', value: stats?.totalConsultations ?? 0, icon: CalendarClock, color: 'text-primary', tab: 'consultations' as TabId },
    { label: 'Contact Messages', value: stats?.totalContacts ?? 0, icon: Mail, color: 'text-success', tab: 'contacts' as TabId },
    { label: 'AI Visibility', value: stats?.totalAIVisibilityRecords ?? 0, icon: Globe, color: 'text-accent-foreground', tab: 'ai-visibility' as TabId },
  ];

  return (
    <div className="flex flex-col gap-6" data-icod-id="admin_overview_root">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-icod-id="admin_overview_stats_grid">
        {statCards.map((card) => (
          <DashboardCard
            key={card.label}
            heading={card.label}
            icon={<card.icon className={cn('h-5 w-5', card.color)} />}
            premium
            className="cursor-pointer transition-transform hover:scale-[1.02]"
            onClick={() => onNavigate(card.tab)}
            data-icod-id={`admin_overview_stat_${card.label}`}>
            <div className="flex items-end gap-2" data-icod-id={`admin_overview_stat_val_${card.label}`}>
              <span
                className="font-heading text-3xl font-bold text-foreground"
                data-icod-id={`src_pages_dashboard_adminconsole_tsx_36d9_${card.label}`}>{card.value.toLocaleString()}</span>
              <ChevronRight
                className="mb-1 h-4 w-4 text-muted-foreground"
                data-icod-id={`src_pages_dashboard_adminconsole_tsx_5aaa_${card.label}`} />
            </div>
          </DashboardCard>
        ))}
      </div>
      {/* Quick Actions */}
      <DashboardCard heading="Quick Actions" icon={<TrendingUp
        className="h-5 w-5 text-primary"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_fc75" />} data-icod-id="admin_overview_actions">
        <div className="flex flex-wrap gap-3" data-icod-id="admin_overview_actions_list">
          <Button variant="outline" size="sm" onClick={() => onNavigate('users')} data-icod-id="admin_overview_action_users">Manage Users</Button>
          <Button variant="outline" size="sm" onClick={() => onNavigate('services')} data-icod-id="admin_overview_action_services">Edit Services</Button>
          <Button variant="outline" size="sm" onClick={() => onNavigate('blog')} data-icod-id="admin_overview_action_blog">Write Blog Post</Button>
          <Button variant="outline" size="sm" onClick={() => onNavigate('api-monitor')} data-icod-id="admin_overview_action_api">View API Monitor</Button>
        </div>
      </DashboardCard>
    </div>
  );
}

// ─── Portfolio Tab ─────────────────────────────────────────────────────────────

function PortfolioTab() {
  const [items, setItems] = useState<PortfolioAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioAdmin | null>(null);
  const [formData, setFormData] = useState<Partial<CreatePortfolioInput>>({ title: '', description: '', imageUrl: '', projectUrl: '', category: '' });

  const loadItems = useCallback(async () => {
    try { const data = await adminApiService.getPortfolioItems(); setItems(data); } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.category) { alert('Title, description, and category are required'); return; }
    if (editingItem) {
      const updated = await adminApiService.updatePortfolioItem(editingItem._id, formData);
      setItems((prev) => prev.map((i) => (i._id === editingItem._id ? updated : i)));
    } else {
      const created = await adminApiService.createPortfolioItem(formData as CreatePortfolioInput);
      setItems((prev) => [created, ...prev]);
    }
    setModalOpen(false); setEditingItem(null); setFormData({ title: '', description: '', imageUrl: '', projectUrl: '', category: '' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) { await adminApiService.deletePortfolioItem(id); setItems((prev) => prev.filter((i) => i._id !== id)); }
  };

  if (loading) return (
    <div
      className="flex justify-center py-12"
      data-icod-id="src_pages_dashboard_adminconsole_tsx_2718"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_0d90" /></div>
  );

  return (
    <div
      className="flex flex-col gap-4"
      data-icod-id="src_pages_dashboard_adminconsole_tsx_8ff3">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_5666">
        <h3
          className="font-heading text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_59b8">Portfolio Items ({items.length})</h3>
        <Button
          variant="primary"
          size="sm"
          onClick={() => { setEditingItem(null); setFormData({ title: '', description: '', imageUrl: '', projectUrl: '', category: '' }); setModalOpen(true); }}
          data-icod-id="src_pages_dashboard_adminconsole_tsx_50cb">
          <Plus
            className="mr-2 h-4 w-4"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_1556" /> Add Item
        </Button>
      </div>
      {items.length === 0 ? (<EmptyState
        title="No portfolio items"
        description="Add your first portfolio item."
        data-icod-id="src_pages_dashboard_adminconsole_tsx_f9a9" />) : (
        <Card
          className="overflow-hidden"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_293d"><div
          className="overflow-x-auto"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_2553"><table
          className="w-full text-left text-sm"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_09d3">
          <thead data-icod-id="src_pages_dashboard_adminconsole_tsx_561d"><tr
            className="border-b border-border bg-muted/30"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_4ac5">
            <th
              className="px-4 py-3 font-semibold text-foreground"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_7d09">Title</th>
            <th
              className="px-4 py-3 font-semibold text-foreground"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_0536">Category</th>
            <th
              className="px-4 py-3 font-semibold text-foreground"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_cfa6">Description</th>
            <th
              className="px-4 py-3 font-semibold text-foreground text-right"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_e82e">Actions</th>
          </tr></thead>
          <tbody data-icod-id="src_pages_dashboard_adminconsole_tsx_c376">{items.map((item) => (
            <tr
              key={item._id}
              className="border-b border-border/50 hover:bg-muted/20 transition-colors"
              data-icod-id={`src_pages_dashboard_adminconsole_tsx_935c_${item._id}`}>
              <td
                className="px-4 py-3 font-medium text-foreground"
                data-icod-id={`src_pages_dashboard_adminconsole_tsx_b3d5_${item._id}`}>{item.title}</td>
              <td
                className="px-4 py-3 text-muted-foreground"
                data-icod-id={`src_pages_dashboard_adminconsole_tsx_757e_${item._id}`}>{item.category}</td>
              <td
                className="px-4 py-3 text-muted-foreground line-clamp-1 max-w-[250px]"
                data-icod-id={`src_pages_dashboard_adminconsole_tsx_d3ff_${item._id}`}>{item.description}</td>
              <td
                className="px-4 py-3 text-right"
                data-icod-id={`src_pages_dashboard_adminconsole_tsx_49e8_${item._id}`}><div
                className="flex items-center justify-end gap-1"
                data-icod-id={`src_pages_dashboard_adminconsole_tsx_ad4b_${item._id}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setEditingItem(item); setFormData({ title: item.title, description: item.description, imageUrl: item.imageUrl, projectUrl: item.projectUrl, category: item.category }); setModalOpen(true); }}
                  data-icod-id={`src_pages_dashboard_adminconsole_tsx_57b7_${item._id}`}><Edit
                  className="h-4 w-4"
                  data-icod-id={`src_pages_dashboard_adminconsole_tsx_5801_${item._id}`} /></Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(item._id)}
                  className="text-destructive hover:text-destructive"
                  data-icod-id={`src_pages_dashboard_adminconsole_tsx_d472_${item._id}`}><Trash2
                  className="h-4 w-4"
                  data-icod-id={`src_pages_dashboard_adminconsole_tsx_ee3b_${item._id}`} /></Button>
              </div></td>
            </tr>))}
          </tbody>
        </table></div></Card>
      )}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
        footer={<div
          className="flex gap-2 justify-end"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_62ab"><Button
          variant="ghost"
          onClick={() => setModalOpen(false)}
          data-icod-id="src_pages_dashboard_adminconsole_tsx_c59d">Cancel</Button><Button
          variant="primary"
          onClick={handleSubmit}
          data-icod-id="src_pages_dashboard_adminconsole_tsx_a3a9">{editingItem ? 'Update' : 'Create'}</Button></div>}
        data-icod-id="src_pages_dashboard_adminconsole_tsx_efcf">
        <div
          className="flex flex-col gap-4"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_9a51">
          <Field
            label="Title"
            htmlFor="port-title"
            required
            data-icod-id="src_pages_dashboard_adminconsole_tsx_4f9d"><Input
            id="port-title"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            data-icod-id="src_pages_dashboard_adminconsole_tsx_d95a" /></Field>
          <Field
            label="Category"
            htmlFor="port-cat"
            required
            data-icod-id="src_pages_dashboard_adminconsole_tsx_d4af"><Input
            id="port-cat"
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            data-icod-id="src_pages_dashboard_adminconsole_tsx_fbff" /></Field>
          <Field
            label="Description"
            htmlFor="port-desc"
            required
            data-icod-id="src_pages_dashboard_adminconsole_tsx_6d6a"><Input
            id="port-desc"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            data-icod-id="src_pages_dashboard_adminconsole_tsx_0b78" /></Field>
          <Field
            label="Image URL"
            htmlFor="port-img"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_6d87"><Input
            id="port-img"
            value={formData.imageUrl || ''}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            data-icod-id="src_pages_dashboard_adminconsole_tsx_2b45" /></Field>
          <Field
            label="Project URL"
            htmlFor="port-url"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_0dbf"><Input
            id="port-url"
            value={formData.projectUrl || ''}
            onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
            data-icod-id="src_pages_dashboard_adminconsole_tsx_3a60" /></Field>
        </div>
      </Modal>
    </div>
  );
}

// ─── About / Founder Tab ──────────────────────────────────────────────────────

function AboutFounderTab() {
  const [founder, setFounder] = useState<FounderAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpsertFounderInput>({ name: '', bio: '', title: '', photo: '' });

  useEffect(() => {
    adminApiService.getFounder().then((data) => {
      if (data) { setFounder(data); setFormData({ name: data.name, bio: data.bio, title: data.title, photo: data.photo, socialLinks: data.socialLinks }); }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.bio || !formData.title) { alert('Name, bio, and title are required'); return; }
    setSaving(true);
    try { const updated = await adminApiService.upsertFounder(formData); setFounder(updated); } catch { /* ignore */ } finally { setSaving(false); }
  };

  if (loading) return (
    <div
      className="flex justify-center py-12"
      data-icod-id="src_pages_dashboard_adminconsole_tsx_0072"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_cae4" /></div>
  );

  return (
    <div
      className="flex flex-col gap-4"
      data-icod-id="src_pages_dashboard_adminconsole_tsx_ab43">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_3338">
        <h3
          className="font-heading text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_2888">About / Founder</h3>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          loading={saving}
          data-icod-id="src_pages_dashboard_adminconsole_tsx_255b">Save Changes</Button>
      </div>
      <Card className="p-6" data-icod-id="src_pages_dashboard_adminconsole_tsx_440c"><div
        className="flex flex-col gap-4 max-w-2xl"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_11ae">
        <Field
          label="Name"
          htmlFor="founder-name"
          required
          data-icod-id="src_pages_dashboard_adminconsole_tsx_825a"><Input
          id="founder-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          data-icod-id="src_pages_dashboard_adminconsole_tsx_d735" /></Field>
        <Field
          label="Title"
          htmlFor="founder-title"
          required
          data-icod-id="src_pages_dashboard_adminconsole_tsx_86a0"><Input
          id="founder-title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          data-icod-id="src_pages_dashboard_adminconsole_tsx_3b71" /></Field>
        <Field
          label="Photo URL"
          htmlFor="founder-photo"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_9c21"><Input
          id="founder-photo"
          value={formData.photo || ''}
          onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
          data-icod-id="src_pages_dashboard_adminconsole_tsx_e770" /></Field>
        <Field
          label="Bio"
          htmlFor="founder-bio"
          required
          data-icod-id="src_pages_dashboard_adminconsole_tsx_3b22">
          <textarea
            id="founder-bio"
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground min-h-[120px]"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            data-icod-id="src_pages_dashboard_adminconsole_tsx_8408" />
        </Field>
        {founder && <div
          className="text-xs text-muted-foreground"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_43ba">Last updated: {new Date(founder.updatedAt).toLocaleString()}</div>}
      </div></Card>
    </div>
  );
}

// ─── Clone a Website Tab ──────────────────────────────────────────────────────

function CloneWebsiteTab() {
  const [clones, setClones] = useState<CloneAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminApiService.getClones().then((data) => setClones(data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this clone record?')) { await adminApiService.deleteClone(id); setClones((prev) => prev.filter((c) => c._id !== id)); }
  };

  if (loading) return (
    <div
      className="flex justify-center py-12"
      data-icod-id="src_pages_dashboard_adminconsole_tsx_3e40"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_d0ae" /></div>
  );

  return (
    <div
      className="flex flex-col gap-4"
      data-icod-id="src_pages_dashboard_adminconsole_tsx_beba">
      <h3
        className="font-heading text-lg font-semibold text-foreground"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_5fd8">Saved Clones ({clones.length})</h3>
      {clones.length === 0 ? (<EmptyState
        title="No clones"
        description="No website clones have been saved yet."
        data-icod-id="src_pages_dashboard_adminconsole_tsx_7105" />) : (
        <Card
          className="overflow-hidden"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_fa1c"><div
          className="overflow-x-auto"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_d8ca"><table
          className="w-full text-left text-sm"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_4181">
          <thead data-icod-id="src_pages_dashboard_adminconsole_tsx_d9c5"><tr
            className="border-b border-border bg-muted/30"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_cae7">
            <th
              className="px-4 py-3 font-semibold text-foreground"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_9c27">Source URL</th>
            <th
              className="px-4 py-3 font-semibold text-foreground"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_0746">File Path</th>
            <th
              className="px-4 py-3 font-semibold text-foreground"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_f10c">Size</th>
            <th
              className="px-4 py-3 font-semibold text-foreground"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_11cd">Date</th>
            <th
              className="px-4 py-3 font-semibold text-foreground text-right"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_0f09">Actions</th>
          </tr></thead>
          <tbody data-icod-id="src_pages_dashboard_adminconsole_tsx_dfd1">{clones.map((clone) => (
            <tr
              key={clone._id}
              className="border-b border-border/50 hover:bg-muted/20 transition-colors"
              data-icod-id={`src_pages_dashboard_adminconsole_tsx_e848_${clone._id}`}>
              <td
                className="px-4 py-3 font-medium text-foreground truncate max-w-[250px]"
                data-icod-id={`src_pages_dashboard_adminconsole_tsx_d154_${clone._id}`}>{clone.source}</td>
              <td
                className="px-4 py-3 text-muted-foreground font-mono text-xs truncate max-w-[200px]"
                data-icod-id={`src_pages_dashboard_adminconsole_tsx_bcfe_${clone._id}`}>{clone.filePath}</td>
              <td
                className="px-4 py-3 text-muted-foreground"
                data-icod-id={`src_pages_dashboard_adminconsole_tsx_d909_${clone._id}`}>{clone.bytes ? `${(clone.bytes / 1024).toFixed(1)} KB` : '-'}</td>
              <td
                className="px-4 py-3 text-muted-foreground text-xs"
                data-icod-id={`src_pages_dashboard_adminconsole_tsx_912f_${clone._id}`}>{new Date(clone.createdAt).toLocaleDateString()}</td>
              <td
                className="px-4 py-3 text-right"
                data-icod-id={`src_pages_dashboard_adminconsole_tsx_31a6_${clone._id}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(clone._id)}
                  className="text-destructive hover:text-destructive"
                  data-icod-id={`src_pages_dashboard_adminconsole_tsx_3369_${clone._id}`}><Trash2
                  className="h-4 w-4"
                  data-icod-id={`src_pages_dashboard_adminconsole_tsx_8bd3_${clone._id}`} /></Button>
              </td>
            </tr>))}
          </tbody>
        </table></div></Card>
      )}
    </div>
  );
}

// ─── 30-Day Plan Tab ──────────────────────────────────────────────────────────

function ThirtyDayPlanTab() {
  const [plans, setPlans] = useState<ThirtyDayPlanAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ThirtyDayPlanAdmin | null>(null);
  const [formData, setFormData] = useState<Partial<CreateThirtyDayPlanInput>>({ dayNumber: 1, title: '', description: '', tasks: [], resources: [] });

  const loadPlans = useCallback(async () => {
    try { const data = await adminApiService.getThirtyDayPlans(); setPlans(data); } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  const handleSubmit = async () => {
    if (formData.dayNumber === undefined || !formData.title || !formData.description) { alert('Day number, title, and description are required'); return; }
    if (editingPlan) {
      const updated = await adminApiService.updateThirtyDayPlan(editingPlan._id, formData);
      setPlans((prev) => prev.map((p) => (p._id === editingPlan._id ? updated : p)));
    } else {
      const created = await adminApiService.createThirtyDayPlan(formData as CreateThirtyDayPlanInput);
      setPlans((prev) => [...prev, created].sort((a, b) => a.dayNumber - b.dayNumber));
    }
    setModalOpen(false); setEditingPlan(null); setFormData({ dayNumber: 1, title: '', description: '', tasks: [], resources: [] });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) { await adminApiService.deleteThirtyDayPlan(id); setPlans((prev) => prev.filter((p) => p._id !== id)); }
  };

  if (loading) return (
    <div
      className="flex justify-center py-12"
      data-icod-id="src_pages_dashboard_adminconsole_tsx_28cf"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_daf8" /></div>
  );

  return (
    <div
      className="flex flex-col gap-4"
      data-icod-id="src_pages_dashboard_adminconsole_tsx_c6a3">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_122c">
        <h3
          className="font-heading text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_0e68">30-Day Plan ({plans.length})</h3>
        <Button
          variant="primary"
          size="sm"
          onClick={() => { setEditingPlan(null); setFormData({ dayNumber: plans.length + 1, title: '', description: '', tasks: [], resources: [] }); setModalOpen(true); }}
          data-icod-id="src_pages_dashboard_adminconsole_tsx_9ea0">
          <Plus
            className="mr-2 h-4 w-4"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_6181" /> Add Day
        </Button>
      </div>
      {plans.length === 0 ? (<EmptyState
        title="No plans"
        description="Create your first 30-day plan entry."
        data-icod-id="src_pages_dashboard_adminconsole_tsx_f494" />) : (
        <Card
          className="overflow-hidden"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_4357"><div
          className="overflow-x-auto"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_4285"><table
          className="w-full text-left text-sm"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_8590">
          <thead data-icod-id="src_pages_dashboard_adminconsole_tsx_85fc"><tr
            className="border-b border-border bg-muted/30"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_d015">
            <th
              className="px-4 py-3 font-semibold text-foreground"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_4af0">Day</th>
            <th
              className="px-4 py-3 font-semibold text-foreground"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_f79b">Title</th>
            <th
              className="px-4 py-3 font-semibold text-foreground"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_2ce4">Description</th>
            <th
              className="px-4 py-3 font-semibold text-foreground"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_9d78">Tasks</th>
            <th
              className="px-4 py-3 font-semibold text-foreground text-right"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_f353">Actions</th>
          </tr></thead>
          <tbody data-icod-id="src_pages_dashboard_adminconsole_tsx_7565">{plans.map((plan) => (
            <tr
              key={plan._id}
              className="border-b border-border/50 hover:bg-muted/20 transition-colors"
              data-icod-id={`src_pages_dashboard_adminconsole_tsx_91c9_${plan._id}`}>
              <td
                className="px-4 py-3 font-bold text-primary"
                data-icod-id={`src_pages_dashboard_adminconsole_tsx_9485_${plan._id}`}>{plan.dayNumber}</td>
              <td
                className="px-4 py-3 font-medium text-foreground"
                data-icod-id={`src_pages_dashboard_adminconsole_tsx_6b91_${plan._id}`}>{plan.title}</td>
              <td
                className="px-4 py-3 text-muted-foreground line-clamp-1 max-w-[250px]"
                data-icod-id={`src_pages_dashboard_adminconsole_tsx_380a_${plan._id}`}>{plan.description}</td>
              <td
                className="px-4 py-3 text-muted-foreground"
                data-icod-id={`src_pages_dashboard_adminconsole_tsx_06b3_${plan._id}`}>{plan.tasks?.length ?? 0} tasks</td>
              <td
                className="px-4 py-3 text-right"
                data-icod-id={`src_pages_dashboard_adminconsole_tsx_3795_${plan._id}`}><div
                className="flex items-center justify-end gap-1"
                data-icod-id={`src_pages_dashboard_adminconsole_tsx_7772_${plan._id}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setEditingPlan(plan); setFormData({ dayNumber: plan.dayNumber, title: plan.title, description: plan.description, tasks: plan.tasks, resources: plan.resources }); setModalOpen(true); }}
                  data-icod-id={`src_pages_dashboard_adminconsole_tsx_53f2_${plan._id}`}><Edit
                  className="h-4 w-4"
                  data-icod-id={`src_pages_dashboard_adminconsole_tsx_d304_${plan._id}`} /></Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(plan._id)}
                  className="text-destructive hover:text-destructive"
                  data-icod-id={`src_pages_dashboard_adminconsole_tsx_bfbe_${plan._id}`}><Trash2
                  className="h-4 w-4"
                  data-icod-id={`src_pages_dashboard_adminconsole_tsx_2919_${plan._id}`} /></Button>
              </div></td>
            </tr>))}
          </tbody>
        </table></div></Card>
      )}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPlan ? `Edit Day ${editingPlan.dayNumber}` : 'Add Day'}
        footer={<div
          className="flex gap-2 justify-end"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_64b7"><Button
          variant="ghost"
          onClick={() => setModalOpen(false)}
          data-icod-id="src_pages_dashboard_adminconsole_tsx_dcc6">Cancel</Button><Button
          variant="primary"
          onClick={handleSubmit}
          data-icod-id="src_pages_dashboard_adminconsole_tsx_3f3d">{editingPlan ? 'Update' : 'Create'}</Button></div>}
        data-icod-id="src_pages_dashboard_adminconsole_tsx_3c2b">
        <div
          className="flex flex-col gap-4"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_7aa0">
          <Field
            label="Day Number"
            htmlFor="plan-day"
            required
            data-icod-id="src_pages_dashboard_adminconsole_tsx_a1d9"><Input
            id="plan-day"
            type="number"
            value={formData.dayNumber ?? 1}
            onChange={(e) => setFormData({ ...formData, dayNumber: Number(e.target.value) })}
            data-icod-id="src_pages_dashboard_adminconsole_tsx_28c0" /></Field>
          <Field
            label="Title"
            htmlFor="plan-title"
            required
            data-icod-id="src_pages_dashboard_adminconsole_tsx_fcee"><Input
            id="plan-title"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            data-icod-id="src_pages_dashboard_adminconsole_tsx_f32a" /></Field>
          <Field
            label="Description"
            htmlFor="plan-desc"
            required
            data-icod-id="src_pages_dashboard_adminconsole_tsx_f97d"><Input
            id="plan-desc"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            data-icod-id="src_pages_dashboard_adminconsole_tsx_eda0" /></Field>
        </div>
      </Modal>
    </div>
  );
}

// ─── Reviews Tab (placeholder) ────────────────────────────────────────────────

function ReviewsTab() {
  return (
    <div
      className="flex flex-col gap-4"
      data-icod-id="src_pages_dashboard_adminconsole_tsx_e5c4">
      <h3
        className="font-heading text-lg font-semibold text-foreground"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_934e">Reviews</h3>
      <EmptyState
        title="No reviews yet"
        description="Reviews will appear here once customers submit them."
        data-icod-id="src_pages_dashboard_adminconsole_tsx_bbd9" />
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab({
  users,
  usersStatus,
}: {
  users: AdminUser[];
  usersStatus: string;
}) {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (usersStatus === 'idle') dispatch(fetchUsers());
  }, [dispatch, usersStatus]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (userToDelete) {
      await dispatch(deleteUserThunk(userToDelete));
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  if (usersStatus === 'loading') {
    return <div className="flex justify-center py-12" data-icod-id="admin_users_loading"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_7a81" /></div>;
  }

  return (
    <div className="flex flex-col gap-4" data-icod-id="admin_users_root">
      {/* Search */}
      <div className="max-w-md" data-icod-id="admin_users_search">
        <Field label="" htmlFor="user-search" data-icod-id="admin_users_search_field">
          <Input
            id="user-search"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-icod-id="admin_users_search_input" />
        </Field>
      </div>
      {/* Users Table */}
      <Card className="overflow-hidden" data-icod-id="admin_users_table_card">
        <div className="overflow-x-auto" data-icod-id="admin_users_table_wrap">
          <table className="w-full text-left text-sm" data-icod-id="admin_users_table">
            <thead data-icod-id="admin_users_thead">
              <tr className="border-b border-border bg-muted/30" data-icod-id="admin_users_header_row">
                <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_users_th_name">Name</th>
                <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_users_th_email">Email</th>
                <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_users_th_role">Role</th>
                <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_users_th_status">Status</th>
                <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_users_th_joined">Joined</th>
                <th className="px-4 py-3 font-semibold text-foreground text-right" data-icod-id="admin_users_th_actions">Actions</th>
              </tr>
            </thead>
            <tbody data-icod-id="admin_users_tbody">
              {filteredUsers.length === 0 ? (
                <tr data-icod-id="admin_users_empty_row">
                  <td colSpan={6} className="py-8 text-center text-muted-foreground" data-icod-id="admin_users_empty_cell">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-border/50 hover:bg-muted/20 transition-colors" data-icod-id={`admin_users_row_${user._id}`}>
                    <td className="px-4 py-3 font-medium text-foreground" data-icod-id={`admin_users_name_${user._id}`}>{user.name}</td>
                    <td className="px-4 py-3 text-muted-foreground" data-icod-id={`admin_users_email_${user._id}`}>{user.email}</td>
                    <td className="px-4 py-3" data-icod-id={`admin_users_role_${user._id}`}>
                      <select
                        className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground focus:ring-2 focus:ring-ring"
                        value={user.role}
                        onChange={(e) => dispatch(updateUserRole({ userId: user._id, role: e.target.value }))}
                        data-icod-id={`admin_users_role_select_${user._id}`}>
                        <option
                          value="viewer"
                          data-icod-id={`src_pages_dashboard_adminconsole_tsx_3011_${user._id}`}>Viewer</option>
                        <option
                          value="manager"
                          data-icod-id={`src_pages_dashboard_adminconsole_tsx_a851_${user._id}`}>Manager</option>
                        <option
                          value="admin"
                          data-icod-id={`src_pages_dashboard_adminconsole_tsx_f8bd_${user._id}`}>Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3" data-icod-id={`admin_users_status_${user._id}`}>
                      <Badge variant={user.isActive ? 'ai' : 'default'} data-icod-id={`admin_users_badge_${user._id}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs" data-icod-id={`admin_users_date_${user._id}`}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right" data-icod-id={`admin_users_actions_${user._id}`}>
                      <div
                        className="flex items-center justify-end gap-1"
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_f3bd_${user._id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dispatch(toggleUserStatus(user._id))}
                          data-icod-id={`admin_users_toggle_${user._id}`}>
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setUserToDelete(user._id); setDeleteModalOpen(true); }}
                          className="text-destructive hover:text-destructive"
                          data-icod-id={`admin_users_delete_btn_${user._id}`}>
                          <Trash2
                            className="h-4 w-4"
                            data-icod-id={`src_pages_dashboard_adminconsole_tsx_9847_${user._id}`} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete User"
        footer={
          <div className="flex gap-2 justify-end" data-icod-id="admin_users_delete_modal_footer">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)} data-icod-id="admin_users_delete_cancel">Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} data-icod-id="admin_users_delete_confirm">Delete</Button>
          </div>
        }
        data-icod-id="admin_users_delete_modal">
        <p className="text-muted-foreground" data-icod-id="admin_users_delete_text">Are you sure you want to delete this user? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}

// ─── Services Tab ─────────────────────────────────────────────────────────────

function ServicesTab() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<ApiResponse<Service[]>>('/services')
      .then((res) => setServices(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12" data-icod-id="admin_services_loading"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_44bc" /></div>;

  return (
    <div className="flex flex-col gap-4" data-icod-id="admin_services_root">
      <div className="flex items-center justify-between" data-icod-id="admin_services_header">
        <h3 className="font-heading text-lg font-semibold text-foreground" data-icod-id="admin_services_title">All Services ({services.length})</h3>
      </div>

      {services.length === 0 ? (
        <EmptyState title="No services found" description="Create your first service to get started." data-icod-id="admin_services_empty" />
      ) : (
        <Card className="overflow-hidden" data-icod-id="admin_services_table_card">
          <div className="overflow-x-auto" data-icod-id="admin_services_table_wrap">
            <table className="w-full text-left text-sm" data-icod-id="admin_services_table">
              <thead data-icod-id="admin_services_thead">
                <tr className="border-b border-border bg-muted/30" data-icod-id="admin_services_header_row">
                  <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_services_th_title">Title</th>
                  <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_services_th_slug">Slug</th>
                  <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_services_th_price">Price</th>
                  <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_services_th_duration">Duration</th>
                  <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_services_th_order">Order</th>
                </tr>
              </thead>
              <tbody data-icod-id="admin_services_tbody">
                {services.map((svc) => (
                  <tr key={svc._id} className="border-b border-border/50 hover:bg-muted/20 transition-colors" data-icod-id={`admin_services_row_${svc._id}`}>
                    <td className="px-4 py-3 font-medium text-foreground" data-icod-id={`admin_services_name_${svc._id}`}>{svc.title}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs" data-icod-id={`admin_services_slug_${svc._id}`}>{svc.slug}</td>
                    <td className="px-4 py-3 text-foreground" data-icod-id={`admin_services_price_${svc._id}`}>{svc.price}</td>
                    <td className="px-4 py-3 text-muted-foreground" data-icod-id={`admin_services_dur_${svc._id}`}>{svc.duration}</td>
                    <td className="px-4 py-3 text-muted-foreground" data-icod-id={`admin_services_order_${svc._id}`}>{svc.order}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Blog Tab ─────────────────────────────────────────────────────────────────

function BlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  useEffect(() => {
    apiClient.get<ApiResponse<{ posts?: BlogPost[] } | BlogPost[]>>('/blog', { params: { limit: 100 } })
      .then((res) => {
        const d = res.data.data;
        if (Array.isArray(d)) {
          setPosts(d);
        } else if (d && typeof d === 'object' && Array.isArray((d as any).posts)) {
          setPosts((d as any).posts);
        } else {
          setPosts([]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12" data-icod-id="admin_blog_loading"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_c58c" /></div>;

  const safePosts = Array.isArray(posts) ? posts : [];
  const totalPages = Math.max(1, Math.ceil(safePosts.length / postsPerPage));
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = safePosts.slice(startIndex, startIndex + postsPerPage);

  return (
    <div className="flex flex-col gap-4" data-icod-id="admin_blog_root">
      <div className="flex items-center justify-between" data-icod-id="admin_blog_header">
        <h3 className="font-heading text-lg font-semibold text-foreground" data-icod-id="admin_blog_title">Blog Posts ({safePosts.length})</h3>
      </div>

      {safePosts.length === 0 ? (
        <EmptyState title="No blog posts" description="Create your first blog post." data-icod-id="admin_blog_empty" />
      ) : (
        <>
          <Card className="overflow-hidden" data-icod-id="admin_blog_table_card">
            <div className="overflow-x-auto" data-icod-id="admin_blog_table_wrap">
              <table className="w-full text-left text-sm" data-icod-id="admin_blog_table">
                <thead data-icod-id="admin_blog_thead">
                  <tr className="border-b border-border bg-muted/30" data-icod-id="admin_blog_header_row">
                    <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_blog_th_title">Title</th>
                    <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_blog_th_category">Category</th>
                    <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_blog_th_author">Author</th>
                    <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_blog_th_status">Status</th>
                    <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_blog_th_date">Created</th>
                  </tr>
                </thead>
                <tbody data-icod-id="admin_blog_tbody">
                  {paginatedPosts.map((post) => (
                    <tr key={post._id || post.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors" data-icod-id={`admin_blog_row_${post._id}`}>
                      <td className="px-4 py-3 font-medium text-foreground" data-icod-id={`admin_blog_title_${post._id}`}>{post.title}</td>
                      <td className="px-4 py-3 text-muted-foreground" data-icod-id={`admin_blog_cat_${post._id}`}>{post.category || '-'}</td>
                      <td className="px-4 py-3 text-muted-foreground" data-icod-id={`admin_blog_author_${post._id}`}>{post.author || '-'}</td>
                      <td className="px-4 py-3" data-icod-id={`admin_blog_status_${post._id}`}>
                        <Badge variant={post.status === 'published' ? 'ai' : 'new'} data-icod-id={`admin_blog_badge_${post._id}`}>
                          {post.status || 'draft'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs" data-icod-id={`admin_blog_date_${post._id}`}>
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            data-icod-id="admin_blog_pagination" />
        </>
      )}
    </div>
  );
}

// ─── Projects Tab ─────────────────────────────────────────────────────────────

function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<ApiResponse<Project[]>>('/projects')
      .then((res) => setProjects(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12" data-icod-id="admin_projects_loading"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_87cb" /></div>;

  return (
    <div className="flex flex-col gap-4" data-icod-id="admin_projects_root">
      <div className="flex items-center justify-between" data-icod-id="admin_projects_header">
        <h3 className="font-heading text-lg font-semibold text-foreground" data-icod-id="admin_projects_title">All Projects ({projects.length})</h3>
      </div>

      {projects.length === 0 ? (
        <EmptyState title="No projects" description="No projects have been created yet." data-icod-id="admin_projects_empty" />
      ) : (
        <Card className="overflow-hidden" data-icod-id="admin_projects_table_card">
          <div className="overflow-x-auto" data-icod-id="admin_projects_table_wrap">
            <table className="w-full text-left text-sm" data-icod-id="admin_projects_table">
              <thead data-icod-id="admin_projects_thead">
                <tr className="border-b border-border bg-muted/30" data-icod-id="admin_projects_header_row">
                  <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_projects_th_name">Project Name</th>
                  <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_projects_th_url">URL</th>
                  <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_projects_th_owner">Owner</th>
                  <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_projects_th_created">Created</th>
                </tr>
              </thead>
              <tbody data-icod-id="admin_projects_tbody">
                {projects.map((proj) => (
                  <tr key={proj._id} className="border-b border-border/50 hover:bg-muted/20 transition-colors" data-icod-id={`admin_projects_row_${proj._id}`}>
                    <td className="px-4 py-3 font-medium text-foreground" data-icod-id={`admin_projects_name_${proj._id}`}>{proj.name}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs truncate max-w-[200px]" data-icod-id={`admin_projects_url_${proj._id}`}>{proj.url}</td>
                    <td className="px-4 py-3 text-muted-foreground" data-icod-id={`admin_projects_owner_${proj._id}`}>{proj.userId}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs" data-icod-id={`admin_projects_date_${proj._id}`}>
                      {new Date(proj.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Consultations Tab ────────────────────────────────────────────────────────

function ConsultationsTab() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<ApiResponse<Consultation[] | { consultations?: Consultation[] }>>('/consultations')
      .then((res) => {
        const d = res.data.data;
        if (Array.isArray(d)) {
          setConsultations(d);
        } else if (d && typeof d === 'object' && Array.isArray((d as any).consultations)) {
          setConsultations((d as any).consultations);
        } else {
          setConsultations([]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'warning';
    }
  };

  if (loading) return <div className="flex justify-center py-12" data-icod-id="admin_consultations_loading"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_b2d8" /></div>;

  return (
    <div className="flex flex-col gap-4" data-icod-id="admin_consultations_root">
      <div className="flex items-center justify-between" data-icod-id="admin_consultations_header">
        <h3 className="font-heading text-lg font-semibold text-foreground" data-icod-id="admin_consultations_title">Consultation Bookings ({(Array.isArray(consultations) ? consultations : []).length})</h3>
      </div>

      {(Array.isArray(consultations) ? consultations : []).length === 0 ? (
        <EmptyState title="No consultations" description="No consultation bookings yet." data-icod-id="admin_consultations_empty" />
      ) : (
        <Card className="overflow-hidden" data-icod-id="admin_consultations_table_card">
          <div className="overflow-x-auto" data-icod-id="admin_consultations_table_wrap">
            <table className="w-full text-left text-sm" data-icod-id="admin_consultations_table">
              <thead data-icod-id="admin_consultations_thead">
                <tr className="border-b border-border bg-muted/30" data-icod-id="admin_consultations_header_row">
                  <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_consultations_th_name">Name</th>
                  <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_consultations_th_email">Email</th>
                  <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_consultations_th_service">Service</th>
                  <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_consultations_th_date">Date</th>
                  <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_consultations_th_status">Status</th>
                </tr>
              </thead>
              <tbody data-icod-id="admin_consultations_tbody">
                {(Array.isArray(consultations) ? consultations : []).map((c) => (
                  <tr key={c._id} className="border-b border-border/50 hover:bg-muted/20 transition-colors" data-icod-id={`admin_consultations_row_${c._id}`}>
                    <td className="px-4 py-3 font-medium text-foreground" data-icod-id={`admin_consultations_name_${c._id}`}>{c.name ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground" data-icod-id={`admin_consultations_email_${c._id}`}>{c.email ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground" data-icod-id={`admin_consultations_svc_${c._id}`}>{c.service ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs" data-icod-id={`admin_consultations_date_${c._id}`}>{(() => { try { const d = new Date(c.preferredDate); return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return '—'; } })()}</td>
                    <td className="px-4 py-3" data-icod-id={`admin_consultations_status_${c._id}`}>
                      <Badge variant={statusVariant(c.status ?? 'pending') as any} data-icod-id={`admin_consultations_badge_${c._id}`}>{c.status ?? 'pending'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── AI Tools Tab ─────────────────────────────────────────────────────────────

function AIToolsTab() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<ApiResponse<AITool[]>>('/ai-tools')
      .then((res) => setTools(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12" data-icod-id="admin_ai_tools_loading"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_6d0e" /></div>;

  return (
    <div className="flex flex-col gap-4" data-icod-id="admin_ai_tools_root">
      <div className="flex items-center justify-between" data-icod-id="admin_ai_tools_header">
        <h3 className="font-heading text-lg font-semibold text-foreground" data-icod-id="admin_ai_tools_title">AI Tools ({tools.length})</h3>
      </div>
      {tools.length === 0 ? (
        <EmptyState title="No AI tools" description="No AI tools configured." data-icod-id="admin_ai_tools_empty" />
      ) : (
        <Card className="overflow-hidden" data-icod-id="admin_ai_tools_table_card">
          <div className="overflow-x-auto" data-icod-id="admin_ai_tools_table_wrap">
            <table className="w-full text-left text-sm" data-icod-id="admin_ai_tools_table">
              <thead data-icod-id="admin_ai_tools_thead">
                <tr className="border-b border-border bg-muted/30" data-icod-id="admin_ai_tools_header_row">
                  <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_ai_tools_th_name">Name</th>
                  <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_ai_tools_th_slug">Slug</th>
                  <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_ai_tools_th_category">Category</th>
                  <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_ai_tools_th_status">Status</th>
                  <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_ai_tools_th_free">Free</th>
                </tr>
              </thead>
              <tbody data-icod-id="admin_ai_tools_tbody">
                {tools.map((tool) => (
                  <tr key={tool._id} className="border-b border-border/50 hover:bg-muted/20 transition-colors" data-icod-id={`admin_ai_tools_row_${tool._id}`}>
                    <td className="px-4 py-3 font-medium text-foreground" data-icod-id={`admin_ai_tools_name_${tool._id}`}>{tool.name}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs" data-icod-id={`admin_ai_tools_slug_${tool._id}`}>{tool.slug}</td>
                    <td className="px-4 py-3 text-muted-foreground" data-icod-id={`admin_ai_tools_cat_${tool._id}`}>{tool.category}</td>
                    <td className="px-4 py-3" data-icod-id={`admin_ai_tools_status_${tool._id}`}>
                      <Badge variant={tool.status === 'live' ? 'ai' : 'new'} data-icod-id={`admin_ai_tools_badge_${tool._id}`}>
                        {tool.status || 'live'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3" data-icod-id={`admin_ai_tools_free_${tool._id}`}>
                      {tool.isFree ? <CheckCircle2
                        className="h-4 w-4 text-success"
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_5727_${tool._id}`} /> : <XCircle
                        className="h-4 w-4 text-muted-foreground"
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_0aa2_${tool._id}`} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── API Monitor Tab ──────────────────────────────────────────────────────────

function ApiMonitorTab({
  apiLogStats,
  apiLogStatsStatus,
}: {
  apiLogStats: RootState['admin']['apiLogStats'];
  apiLogStatsStatus: string;
}) {
  const dispatch = useAppDispatch();

  const fetchData = useCallback(() => {
    dispatch(fetchApiLogStats());
  }, [dispatch]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  if (apiLogStatsStatus === 'loading' && !apiLogStats) {
    return <div className="flex justify-center py-12" data-icod-id="admin_api_monitor_loading"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_979d" /></div>;
  }

  return (
    <div className="flex flex-col gap-6" data-icod-id="admin_api_monitor_root">
      <div className="flex items-center justify-between" data-icod-id="admin_api_monitor_header">
        <h3 className="font-heading text-lg font-semibold text-foreground" data-icod-id="admin_api_monitor_title">API Monitor (Last Hour)</h3>
        <Button variant="outline" size="sm" onClick={fetchData} data-icod-id="admin_api_monitor_refresh">
          <RefreshCw
            className={cn('mr-2 h-4 w-4', apiLogStatsStatus === 'loading' && 'animate-spin')}
            data-icod-id="src_pages_dashboard_adminconsole_tsx_b261" />
          Refresh
        </Button>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" data-icod-id="admin_api_monitor_stats_grid">
        <DashboardCard heading="Requests" icon={<Activity
          className="h-5 w-5 text-primary"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_0bd5" />} data-icod-id="admin_api_monitor_req_card">
          <span className="font-heading text-3xl font-bold text-foreground" data-icod-id="admin_api_monitor_req_val">
            {apiLogStats?.requestCount.toLocaleString() ?? '-'}
          </span>
        </DashboardCard>
        <DashboardCard heading="Error Rate" icon={<AlertTriangle
          className="h-5 w-5 text-destructive"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_e95d" />} data-icod-id="admin_api_monitor_err_card">
          <span className={cn('font-heading text-3xl font-bold', (apiLogStats?.errorRate ?? 0) > 5 ? 'text-destructive' : 'text-success')} data-icod-id="admin_api_monitor_err_val">
            {apiLogStats?.errorRate ?? '-'}%
          </span>
        </DashboardCard>
        <DashboardCard heading="Avg Response Time" icon={<Clock
          className="h-5 w-5 text-warning"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_020a" />} data-icod-id="admin_api_monitor_avg_card">
          <span className="font-heading text-3xl font-bold text-foreground" data-icod-id="admin_api_monitor_avg_val">
            {apiLogStats?.avgResponseTime ?? '-'}ms
          </span>
        </DashboardCard>
        <DashboardCard heading="Errors" icon={<XCircle
          className="h-5 w-5 text-destructive"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_cffb" />} data-icod-id="admin_api_monitor_errors_card">
          <span className="font-heading text-3xl font-bold text-destructive" data-icod-id="admin_api_monitor_errors_val">
            {apiLogStats?.errorCount ?? '-'}
          </span>
        </DashboardCard>
      </div>
      {/* Slowest Endpoints */}
      <DashboardCard heading="Slowest Endpoints" icon={<TrendingUp
        className="h-5 w-5 text-warning"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_9adf" />} data-icod-id="admin_api_monitor_slowest">
        {apiLogStats?.slowestEndpoints && apiLogStats.slowestEndpoints.length > 0 ? (
          <div className="overflow-x-auto" data-icod-id="admin_api_monitor_slowest_table_wrap">
            <table className="w-full text-left text-sm" data-icod-id="admin_api_monitor_slowest_table">
              <thead data-icod-id="admin_api_monitor_slowest_thead">
                <tr className="border-b border-border bg-muted/30" data-icod-id="admin_api_monitor_slowest_header">
                  <th className="px-4 py-2 font-semibold text-foreground" data-icod-id="admin_api_monitor_slowest_th_path">Endpoint</th>
                  <th className="px-4 py-2 font-semibold text-foreground" data-icod-id="admin_api_monitor_slowest_th_avg">Avg (ms)</th>
                  <th className="px-4 py-2 font-semibold text-foreground" data-icod-id="admin_api_monitor_slowest_th_count">Requests</th>
                </tr>
              </thead>
              <tbody data-icod-id="admin_api_monitor_slowest_tbody">
                {apiLogStats.slowestEndpoints.map((ep: { path: string; avgMs: number; count: number }, i: number) => (
                  <tr key={ep.path} className="border-b border-border/50" data-icod-id={`admin_api_monitor_slowest_row_${i}`}>
                    <td className="px-4 py-2 font-mono text-xs text-foreground" data-icod-id={`admin_api_monitor_slowest_path_${i}`}>{ep.path}</td>
                    <td className={cn('px-4 py-2 font-semibold', ep.avgMs > 1000 ? 'text-destructive' : ep.avgMs > 500 ? 'text-warning' : 'text-success')} data-icod-id={`admin_api_monitor_slowest_avg_${i}`}>
                      {ep.avgMs}ms
                    </td>
                    <td className="px-4 py-2 text-muted-foreground" data-icod-id={`admin_api_monitor_slowest_count_${i}`}>{ep.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground" data-icod-id="admin_api_monitor_no_data">No data available for the last hour.</p>
        )}
      </DashboardCard>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab() {
  return (
    <div className="flex flex-col gap-6" data-icod-id="admin_settings_root">
      <DashboardCard heading="System Information" icon={<SettingsIcon
        className="h-5 w-5 text-primary"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_cf21" />} data-icod-id="admin_settings_info">
        <div className="flex flex-col gap-3 text-sm" data-icod-id="admin_settings_info_list">
          <div className="flex items-center justify-between border-b border-border/30 pb-2" data-icod-id="admin_settings_env">
            <span className="text-muted-foreground" data-icod-id="admin_settings_env_label">Environment</span>
            <Badge data-icod-id="admin_settings_env_badge">{import.meta.env.MODE || 'development'}</Badge>
          </div>
          <div className="flex items-center justify-between border-b border-border/30 pb-2" data-icod-id="admin_settings_api">
            <span className="text-muted-foreground" data-icod-id="admin_settings_api_label">API Base URL</span>
            <span className="font-mono text-xs text-foreground" data-icod-id="admin_settings_api_val">{import.meta.env.VITE_API_URL || 'Not set'}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/30 pb-2" data-icod-id="admin_settings_db">
            <span className="text-muted-foreground" data-icod-id="admin_settings_db_label">Database</span>
            <span className="flex items-center gap-1 text-success" data-icod-id="admin_settings_db_val">
              <CheckCircle2
                className="h-3 w-3"
                data-icod-id="src_pages_dashboard_adminconsole_tsx_af3c" /> Connected
            </span>
          </div>
        </div>
      </DashboardCard>
      <DashboardCard heading="AI Provider Settings" icon={<Sparkles
        className="h-5 w-5 text-primary"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_48d4" />} data-icod-id="admin_settings_ai">
        <p className="text-sm text-muted-foreground" data-icod-id="admin_settings_ai_text">
          AI provider configuration is managed in the Dashboard Settings page. Navigate there to configure OpenRouter, Google, Anthropic, and other providers.
        </p>
        <div className="mt-3" data-icod-id="admin_settings_ai_link">
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard/settings'} data-icod-id="admin_settings_go_btn">
            Go to Dashboard Settings
          </Button>
        </div>
      </DashboardCard>
      <Alert variant="info" data-icod-id="admin_settings_notice">
        Payment settings are not currently configured.
      </Alert>
    </div>
  );
}

// ─── SEO Audits Tab ─────────────────────────────────────────────────────────────

function SEOAuditsTab() {
  const dispatch = useAppDispatch();
  const { audits, auditsPagination, auditsStatus } = useAppSelector((s: RootState) => s.admin);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    if (auditsStatus === 'idle') {
      dispatch(fetchAudits({ limit: 20, offset: 0, status: statusFilter || undefined }));
    }
  }, [dispatch, auditsStatus, statusFilter]);

  const handleDelete = async (id: string) => {
    await dispatch(deleteAuditThunk(id));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size > 0) {
      await dispatch(bulkDeleteAuditsThunk(Array.from(selectedIds)));
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === audits.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(audits.map((a) => a._id)));
    }
  };

  if (auditsStatus === 'loading') {
    return (
      <div
        className="flex justify-center py-12"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_07f8"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_5bc6" /></div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4"
      data-icod-id="src_pages_dashboard_adminconsole_tsx_8431">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_7f44">
        <h3
          className="font-heading text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_114e">SEO Audits ({auditsPagination?.total ?? audits.length})</h3>
        <div
          className="flex gap-2"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_935e">
          <select
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              dispatch(fetchAudits({ limit: 20, offset: 0, status: e.target.value || undefined }));
            }}
            data-icod-id="src_pages_dashboard_adminconsole_tsx_b6b1">
            <option value="" data-icod-id="src_pages_dashboard_adminconsole_tsx_ab1b">All Status</option>
            <option
              value="completed"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_5df5">Completed</option>
            <option value="running" data-icod-id="src_pages_dashboard_adminconsole_tsx_9586">Running</option>
            <option value="queued" data-icod-id="src_pages_dashboard_adminconsole_tsx_9537">Queued</option>
            <option value="failed" data-icod-id="src_pages_dashboard_adminconsole_tsx_4f7c">Failed</option>
          </select>
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              data-icod-id="src_pages_dashboard_adminconsole_tsx_f7bc">
              Delete Selected ({selectedIds.size})
            </Button>
          )}
        </div>
      </div>
      {audits.length === 0 ? (
        <EmptyState
          title="No audits found"
          description="No SEO audits have been run yet."
          data-icod-id="src_pages_dashboard_adminconsole_tsx_f33c" />
      ) : (
        <Card
          className="overflow-hidden"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_dea7">
          <div
            className="overflow-x-auto"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_aafc">
            <table
              className="w-full text-left text-sm"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_6066">
              <thead data-icod-id="src_pages_dashboard_adminconsole_tsx_5bba">
                <tr
                  className="border-b border-border bg-muted/30"
                  data-icod-id="src_pages_dashboard_adminconsole_tsx_cf96">
                  <th
                    className="px-4 py-3"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_2e95">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === audits.length && audits.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-border"
                      data-icod-id="src_pages_dashboard_adminconsole_tsx_33fa" />
                  </th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_49ea">Project</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_2c71">Status</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_f94e">SEO Score</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_3f5b">Date</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground text-right"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_5f5a">Actions</th>
                </tr>
              </thead>
              <tbody data-icod-id="src_pages_dashboard_adminconsole_tsx_9dab">
                {audits.map((audit) => (
                  <tr
                    key={audit._id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    data-icod-id={`src_pages_dashboard_adminconsole_tsx_2be9_${audit._id}`}>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_3e02_${audit._id}`}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(audit._id)}
                        onChange={() => toggleSelect(audit._id)}
                        className="rounded border-border"
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_d8f5_${audit._id}`} />
                    </td>
                    <td
                      className="px-4 py-3 font-medium text-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_eea4_${audit._id}`}>
                      {typeof audit.projectId === 'object' ? (audit.projectId as any).name : audit.projectId}
                    </td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_3634_${audit._id}`}>
                      <Badge
                        variant={(audit.status === 'completed' ? 'ai' : audit.status === 'failed' ? 'default' : 'new') as any}
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_cf58_${audit._id}`}>
                        {audit.status}
                      </Badge>
                    </td>
                    <td
                      className="px-4 py-3 text-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_6ba2_${audit._id}`}>{audit.scores?.seo ?? 0}%</td>
                    <td
                      className="px-4 py-3 text-muted-foreground text-xs"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_e829_${audit._id}`}>
                      {new Date(audit.createdAt).toLocaleDateString()}
                    </td>
                    <td
                      className="px-4 py-3 text-right"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_3d4b_${audit._id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(audit._id)}
                        className="text-destructive hover:text-destructive"
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_5027_${audit._id}`}>
                        <Trash2
                          className="h-4 w-4"
                          data-icod-id={`src_pages_dashboard_adminconsole_tsx_4a58_${audit._id}`} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── GSC Connections Tab ────────────────────────────────────────────────────────

function GSCConnectionsTab() {
  const dispatch = useAppDispatch();
  const { gscConnections, gscConnectionsPagination, gscConnectionsStatus } = useAppSelector((s: RootState) => s.admin);

  useEffect(() => {
    if (gscConnectionsStatus === 'idle') {
      dispatch(fetchGSCConnections({ limit: 20, offset: 0 }));
    }
  }, [dispatch, gscConnectionsStatus]);

  const handleRevoke = async (id: string) => {
    if (confirm('Are you sure you want to revoke this GSC connection?')) {
      await dispatch(revokeGSCConnectionThunk(id));
    }
  };

  if (gscConnectionsStatus === 'loading') {
    return (
      <div
        className="flex justify-center py-12"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_b724"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_b426" /></div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4"
      data-icod-id="src_pages_dashboard_adminconsole_tsx_abb6">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_0f60">
        <h3
          className="font-heading text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_a48c">GSC Connections ({gscConnectionsPagination?.total ?? gscConnections.length})</h3>
      </div>
      {gscConnections.length === 0 ? (
        <EmptyState
          title="No GSC connections"
          description="No Google Search Console connections found."
          data-icod-id="src_pages_dashboard_adminconsole_tsx_4037" />
      ) : (
        <Card
          className="overflow-hidden"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_d842">
          <div
            className="overflow-x-auto"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_6d44">
            <table
              className="w-full text-left text-sm"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_5798">
              <thead data-icod-id="src_pages_dashboard_adminconsole_tsx_1391">
                <tr
                  className="border-b border-border bg-muted/30"
                  data-icod-id="src_pages_dashboard_adminconsole_tsx_0b98">
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_7678">Project</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_86f0">Site URL</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_c866">Connected</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_d860">Expires</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground text-right"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_74bd">Actions</th>
                </tr>
              </thead>
              <tbody data-icod-id="src_pages_dashboard_adminconsole_tsx_2563">
                {gscConnections.map((conn) => (
                  <tr
                    key={conn._id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    data-icod-id={`src_pages_dashboard_adminconsole_tsx_623f_${conn._id}`}>
                    <td
                      className="px-4 py-3 font-medium text-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_daed_${conn._id}`}>
                      {typeof conn.projectId === 'object' ? (conn.projectId as any).name : conn.projectId}
                    </td>
                    <td
                      className="px-4 py-3 text-muted-foreground font-mono text-xs"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_4e44_${conn._id}`}>{conn.siteUrl}</td>
                    <td
                      className="px-4 py-3 text-muted-foreground text-xs"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_9604_${conn._id}`}>
                      {new Date(conn.connectedAt).toLocaleDateString()}
                    </td>
                    <td
                      className="px-4 py-3 text-muted-foreground text-xs"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_9275_${conn._id}`}>
                      {new Date(conn.expiresAt).toLocaleDateString()}
                    </td>
                    <td
                      className="px-4 py-3 text-right"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_1dd0_${conn._id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevoke(conn._id)}
                        className="text-destructive hover:text-destructive"
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_fac5_${conn._id}`}>
                        Revoke
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Security Tab ───────────────────────────────────────────────────────────────

function SecurityTab() {
  const dispatch = useAppDispatch();
  const { securityScans, securityScansPagination, securityScansStatus, securityFindingsSummary, securityFindingsSummaryStatus } = useAppSelector((s: RootState) => s.admin);

  useEffect(() => {
    if (securityScansStatus === 'idle') {
      dispatch(fetchSecurityScans({ limit: 20, offset: 0 }));
    }
    if (securityFindingsSummaryStatus === 'idle') {
      dispatch(fetchSecurityFindingsSummary());
    }
  }, [dispatch, securityScansStatus, securityFindingsSummaryStatus]);

  if (securityScansStatus === 'loading') {
    return (
      <div
        className="flex justify-center py-12"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_7ed4"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_a8bd" /></div>
    );
  }

  return (
    <div
      className="flex flex-col gap-6"
      data-icod-id="src_pages_dashboard_adminconsole_tsx_f2db">
      {/* Summary Cards */}
      {securityFindingsSummary && (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_97a1">
          <DashboardCard
            heading="Critical"
            icon={<AlertTriangle
              className="h-5 w-5 text-destructive"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_a6de" />}
            data-icod-id="src_pages_dashboard_adminconsole_tsx_1482">
            <span
              className="font-heading text-3xl font-bold text-destructive"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_8b23">{securityFindingsSummary.criticalTotal}</span>
          </DashboardCard>
          <DashboardCard
            heading="High"
            icon={<AlertTriangle
              className="h-5 w-5 text-warning"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_ab55" />}
            data-icod-id="src_pages_dashboard_adminconsole_tsx_d4c9">
            <span
              className="font-heading text-3xl font-bold text-warning"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_b080">{securityFindingsSummary.highTotal}</span>
          </DashboardCard>
          <DashboardCard
            heading="Medium"
            icon={<Activity
              className="h-5 w-5 text-primary"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_ba35" />}
            data-icod-id="src_pages_dashboard_adminconsole_tsx_28d9">
            <span
              className="font-heading text-3xl font-bold text-primary"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_581b">{securityFindingsSummary.mediumTotal}</span>
          </DashboardCard>
          <DashboardCard
            heading="Low"
            icon={<CheckCircle2
              className="h-5 w-5 text-success"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_e461" />}
            data-icod-id="src_pages_dashboard_adminconsole_tsx_4893">
            <span
              className="font-heading text-3xl font-bold text-success"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_3585">{securityFindingsSummary.lowTotal}</span>
          </DashboardCard>
          <DashboardCard
            heading="Total Scans"
            icon={<Shield
              className="h-5 w-5 text-muted-foreground"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_eb12" />}
            data-icod-id="src_pages_dashboard_adminconsole_tsx_8282">
            <span
              className="font-heading text-3xl font-bold text-foreground"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_da1a">{securityFindingsSummary.totalScans}</span>
          </DashboardCard>
        </div>
      )}
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_577b">
        <h3
          className="font-heading text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_498d">Security Scans ({securityScansPagination?.total ?? securityScans.length})</h3>
      </div>
      {securityScans.length === 0 ? (
        <EmptyState
          title="No security scans"
          description="No security scans have been performed yet."
          data-icod-id="src_pages_dashboard_adminconsole_tsx_face" />
      ) : (
        <Card
          className="overflow-hidden"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_c2eb">
          <div
            className="overflow-x-auto"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_97b5">
            <table
              className="w-full text-left text-sm"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_f515">
              <thead data-icod-id="src_pages_dashboard_adminconsole_tsx_2f4f">
                <tr
                  className="border-b border-border bg-muted/30"
                  data-icod-id="src_pages_dashboard_adminconsole_tsx_1b68">
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_4da7">Target</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_6e95">User</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_bb75">Status</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_b600">Score</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_d4c7">Findings</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_0ad1">Date</th>
                </tr>
              </thead>
              <tbody data-icod-id="src_pages_dashboard_adminconsole_tsx_4494">
                {securityScans.map((scan) => (
                  <tr
                    key={scan._id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    data-icod-id={`src_pages_dashboard_adminconsole_tsx_402a_${scan._id}`}>
                    <td
                      className="px-4 py-3 font-medium text-foreground truncate max-w-[200px]"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_8039_${scan._id}`}>{scan.target}</td>
                    <td
                      className="px-4 py-3 text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_5756_${scan._id}`}>
                      {typeof scan.userId === 'object' ? (scan.userId as any).email : scan.userId}
                    </td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_c2f0_${scan._id}`}>
                      <Badge
                        variant={(scan.status === 'completed' ? 'ai' : scan.status === 'failed' ? 'default' : 'new') as any}
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_adfa_${scan._id}`}>
                        {scan.status}
                      </Badge>
                    </td>
                    <td
                      className="px-4 py-3 text-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_65e1_${scan._id}`}>{scan.score ?? '-'}%</td>
                    <td
                      className="px-4 py-3 text-xs"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_8316_${scan._id}`}>
                      <span
                        className="text-destructive"
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_773c_${scan._id}`}>{scan.findingsCount.critical}C</span> /
                      <span
                        className="text-warning"
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_386b_${scan._id}`}> {scan.findingsCount.high}H</span> /
                      <span
                        className="text-primary"
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_859f_${scan._id}`}> {scan.findingsCount.medium}M</span>
                    </td>
                    <td
                      className="px-4 py-3 text-muted-foreground text-xs"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_b83b_${scan._id}`}>
                      {new Date(scan.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Subscriptions Tab ──────────────────────────────────────────────────────────

function SubscriptionsTab() {
  const dispatch = useAppDispatch();
  const { subscriptions, subscriptionsPagination, subscriptionsStatus, subscriptionStats, subscriptionStatsStatus } = useAppSelector((s: RootState) => s.admin);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    if (subscriptionsStatus === 'idle') {
      dispatch(fetchSubscriptions({ limit: 20, offset: 0, status: statusFilter || undefined }));
    }
    if (subscriptionStatsStatus === 'idle') {
      dispatch(fetchSubscriptionStats());
    }
  }, [dispatch, subscriptionsStatus, subscriptionStatsStatus, statusFilter]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'trialing': return 'ai';
      case 'past_due': return 'warning';
      case 'canceled':
      case 'unpaid': return 'destructive';
      default: return 'default';
    }
  };

  if (subscriptionsStatus === 'loading') {
    return (
      <div
        className="flex justify-center py-12"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_ef7b"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_ff18" /></div>
    );
  }

  return (
    <div
      className="flex flex-col gap-6"
      data-icod-id="src_pages_dashboard_adminconsole_tsx_0871">
      {/* Stats Cards */}
      {subscriptionStats && (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_8ccf">
          <DashboardCard
            heading="Total Subscriptions"
            icon={<CreditCard
              className="h-5 w-5 text-primary"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_d66f" />}
            data-icod-id="src_pages_dashboard_adminconsole_tsx_43c5">
            <span
              className="font-heading text-3xl font-bold text-foreground"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_d0bb">{subscriptionStats.total}</span>
          </DashboardCard>
          <DashboardCard
            heading="Active"
            icon={<CheckCircle2
              className="h-5 w-5 text-success"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_9481" />}
            data-icod-id="src_pages_dashboard_adminconsole_tsx_69a8">
            <span
              className="font-heading text-3xl font-bold text-success"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_9acb">{subscriptionStats.byStatus.active || 0}</span>
          </DashboardCard>
          <DashboardCard
            heading="Past Due"
            icon={<AlertTriangle
              className="h-5 w-5 text-warning"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_7eaa" />}
            data-icod-id="src_pages_dashboard_adminconsole_tsx_3295">
            <span
              className="font-heading text-3xl font-bold text-warning"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_7f89">{subscriptionStats.byStatus.past_due || 0}</span>
          </DashboardCard>
          <DashboardCard
            heading="Canceled"
            icon={<XCircle
              className="h-5 w-5 text-destructive"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_417b" />}
            data-icod-id="src_pages_dashboard_adminconsole_tsx_fb1f">
            <span
              className="font-heading text-3xl font-bold text-destructive"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_b73f">{subscriptionStats.byStatus.canceled || 0}</span>
          </DashboardCard>
        </div>
      )}
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_a403">
        <h3
          className="font-heading text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_2dcb">Subscriptions ({subscriptionsPagination?.total ?? subscriptions.length})</h3>
        <select
          className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            dispatch(fetchSubscriptions({ limit: 20, offset: 0, status: e.target.value || undefined }));
          }}
          data-icod-id="src_pages_dashboard_adminconsole_tsx_71e0">
          <option value="" data-icod-id="src_pages_dashboard_adminconsole_tsx_886d">All Status</option>
          <option value="active" data-icod-id="src_pages_dashboard_adminconsole_tsx_8667">Active</option>
          <option value="trialing" data-icod-id="src_pages_dashboard_adminconsole_tsx_8662">Trialing</option>
          <option value="past_due" data-icod-id="src_pages_dashboard_adminconsole_tsx_0c43">Past Due</option>
          <option value="canceled" data-icod-id="src_pages_dashboard_adminconsole_tsx_1293">Canceled</option>
          <option value="unpaid" data-icod-id="src_pages_dashboard_adminconsole_tsx_78b1">Unpaid</option>
        </select>
      </div>
      {subscriptions.length === 0 ? (
        <EmptyState
          title="No subscriptions"
          description="No subscriptions found."
          data-icod-id="src_pages_dashboard_adminconsole_tsx_26fd" />
      ) : (
        <Card
          className="overflow-hidden"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_9765">
          <div
            className="overflow-x-auto"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_5bf5">
            <table
              className="w-full text-left text-sm"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_0ded">
              <thead data-icod-id="src_pages_dashboard_adminconsole_tsx_f545">
                <tr
                  className="border-b border-border bg-muted/30"
                  data-icod-id="src_pages_dashboard_adminconsole_tsx_b448">
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_6d22">User</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_e23a">Plan</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_615a">Status</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_6b17">Customer ID</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_02e6">Period End</th>
                </tr>
              </thead>
              <tbody data-icod-id="src_pages_dashboard_adminconsole_tsx_37de">
                {subscriptions.map((sub) => (
                  <tr
                    key={sub._id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    data-icod-id={`src_pages_dashboard_adminconsole_tsx_b1ce_${sub._id}`}>
                    <td
                      className="px-4 py-3 font-medium text-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_7169_${sub._id}`}>
                      {typeof sub.userId === 'object' ? (sub.userId as any).email : sub.userId}
                    </td>
                    <td
                      className="px-4 py-3 text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_e09d_${sub._id}`}>{sub.planId}</td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_4aaf_${sub._id}`}>
                      <Badge
                        variant={getStatusVariant(sub.status) as any}
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_de88_${sub._id}`}>{sub.status}</Badge>
                    </td>
                    <td
                      className="px-4 py-3 text-muted-foreground font-mono text-xs"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_cca1_${sub._id}`}>{sub.customerId ? sub.customerId.slice(0, 15) + '...' : '-'}</td>
                    <td
                      className="px-4 py-3 text-muted-foreground text-xs"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_7fa6_${sub._id}`}>
                      {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Courses Tab ────────────────────────────────────────────────────────────────

function CoursesTab() {
  const dispatch = useAppDispatch();
  const { courses, coursesPagination, coursesStatus } = useAppSelector((s: RootState) => s.admin);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseAdmin | null>(null);
  const [formData, setFormData] = useState<Partial<CreateCourseInput>>({
    title: '',
    slug: '',
    description: '',
    instructor: '',
    category: '',
    price: 0,
    level: 'beginner',
    status: 'published',
  });

  useEffect(() => {
    if (coursesStatus === 'idle') {
      dispatch(fetchCourses({ limit: 20, offset: 0 }));
    }
  }, [dispatch, coursesStatus]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.slug || !formData.description || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingCourse) {
      await dispatch(updateCourseThunk({ courseId: editingCourse._id, data: formData }));
    } else {
      await dispatch(createCourseThunk(formData as CreateCourseInput));
    }
    setModalOpen(false);
    setEditingCourse(null);
    setFormData({ title: '', slug: '', description: '', instructor: '', category: '', price: 0, level: 'beginner', status: 'published' });
  };

  const handleEdit = (course: CourseAdmin) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      slug: course.slug,
      description: course.description,
      instructor: course.instructor,
      category: course.category,
      price: course.price,
      level: course.level,
      status: course.status,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      await dispatch(deleteCourseThunk(id));
    }
  };

  if (coursesStatus === 'loading') {
    return (
      <div
        className="flex justify-center py-12"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_3f94"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_a04e" /></div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4"
      data-icod-id="src_pages_dashboard_adminconsole_tsx_22aa">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_0910">
        <h3
          className="font-heading text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_ba1d">Courses ({coursesPagination?.total ?? courses.length})</h3>
        <Button
          variant="primary"
          size="sm"
          onClick={() => { setEditingCourse(null); setFormData({ title: '', slug: '', description: '', instructor: '', category: '', price: 0, level: 'beginner', status: 'published' }); setModalOpen(true); }}
          data-icod-id="src_pages_dashboard_adminconsole_tsx_ca1a">
          <Plus
            className="mr-2 h-4 w-4"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_32c7" /> Add Course
        </Button>
      </div>
      {courses.length === 0 ? (
        <EmptyState
          title="No courses"
          description="Create your first course to get started."
          data-icod-id="src_pages_dashboard_adminconsole_tsx_6bc3" />
      ) : (
        <Card
          className="overflow-hidden"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_ca24">
          <div
            className="overflow-x-auto"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_5f4f">
            <table
              className="w-full text-left text-sm"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_f948">
              <thead data-icod-id="src_pages_dashboard_adminconsole_tsx_fc52">
                <tr
                  className="border-b border-border bg-muted/30"
                  data-icod-id="src_pages_dashboard_adminconsole_tsx_b215">
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_b418">Title</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_1f64">Category</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_3dc3">Price</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_5404">Level</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_feeb">Enrolled</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_01b4">Status</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground text-right"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_5345">Actions</th>
                </tr>
              </thead>
              <tbody data-icod-id="src_pages_dashboard_adminconsole_tsx_8d63">
                {courses.map((course) => (
                  <tr
                    key={course._id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    data-icod-id={`src_pages_dashboard_adminconsole_tsx_3f00_${course._id}`}>
                    <td
                      className="px-4 py-3 font-medium text-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_55a8_${course._id}`}>{course.title}</td>
                    <td
                      className="px-4 py-3 text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_5e6d_${course._id}`}>{course.category}</td>
                    <td
                      className="px-4 py-3 text-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_52c4_${course._id}`}>${course.price}</td>
                    <td
                      className="px-4 py-3 text-muted-foreground capitalize"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_94b3_${course._id}`}>{course.level}</td>
                    <td
                      className="px-4 py-3 text-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_7e13_${course._id}`}>{course.enrolledCount}</td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_8906_${course._id}`}>
                      <Badge
                        variant={(course.status === 'published' ? 'ai' : 'default') as any}
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_22ff_${course._id}`}>{course.status}</Badge>
                    </td>
                    <td
                      className="px-4 py-3 text-right"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_9161_${course._id}`}>
                      <div
                        className="flex items-center justify-end gap-1"
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_dcc7_${course._id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(course)}
                          data-icod-id={`src_pages_dashboard_adminconsole_tsx_b66a_${course._id}`}>
                          <Edit
                            className="h-4 w-4"
                            data-icod-id={`src_pages_dashboard_adminconsole_tsx_6fcf_${course._id}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(course._id)}
                          className="text-destructive hover:text-destructive"
                          data-icod-id={`src_pages_dashboard_adminconsole_tsx_c610_${course._id}`}>
                          <Trash2
                            className="h-4 w-4"
                            data-icod-id={`src_pages_dashboard_adminconsole_tsx_4afd_${course._id}`} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCourse ? 'Edit Course' : 'Add Course'}
        footer={
          <div
            className="flex gap-2 justify-end"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_ae83">
            <Button
              variant="ghost"
              onClick={() => setModalOpen(false)}
              data-icod-id="src_pages_dashboard_adminconsole_tsx_de8b">Cancel</Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              data-icod-id="src_pages_dashboard_adminconsole_tsx_d57f">{editingCourse ? 'Update' : 'Create'}</Button>
          </div>
        }
        data-icod-id="src_pages_dashboard_adminconsole_tsx_e09c">
        <div
          className="flex flex-col gap-4"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_09cb">
          <Field
            label="Title"
            htmlFor="course-title"
            required
            data-icod-id="src_pages_dashboard_adminconsole_tsx_4856">
            <Input
              id="course-title"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              data-icod-id="src_pages_dashboard_adminconsole_tsx_3aa9" />
          </Field>
          <Field
            label="Slug"
            htmlFor="course-slug"
            required
            data-icod-id="src_pages_dashboard_adminconsole_tsx_3fa4">
            <Input
              id="course-slug"
              value={formData.slug || ''}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              data-icod-id="src_pages_dashboard_adminconsole_tsx_42fd" />
          </Field>
          <Field
            label="Description"
            htmlFor="course-desc"
            required
            data-icod-id="src_pages_dashboard_adminconsole_tsx_eccd">
            <Input
              id="course-desc"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              data-icod-id="src_pages_dashboard_adminconsole_tsx_80dd" />
          </Field>
          <Field
            label="Instructor"
            htmlFor="course-instructor"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_c447">
            <Input
              id="course-instructor"
              value={formData.instructor || ''}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              data-icod-id="src_pages_dashboard_adminconsole_tsx_e118" />
          </Field>
          <Field
            label="Category"
            htmlFor="course-category"
            required
            data-icod-id="src_pages_dashboard_adminconsole_tsx_f277">
            <Input
              id="course-category"
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              data-icod-id="src_pages_dashboard_adminconsole_tsx_f8f6" />
          </Field>
          <Field
            label="Price"
            htmlFor="course-price"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_665e">
            <Input
              id="course-price"
              type="number"
              value={formData.price || 0}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              data-icod-id="src_pages_dashboard_adminconsole_tsx_85dd" />
          </Field>
          <Field
            label="Level"
            htmlFor="course-level"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_8abb">
            <select
              id="course-level"
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
              value={formData.level || 'beginner'}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
              data-icod-id="src_pages_dashboard_adminconsole_tsx_007e">
              <option value="beginner" data-icod-id="src_pages_dashboard_adminconsole_tsx_4eb0">Beginner</option>
              <option
                value="intermediate"
                data-icod-id="src_pages_dashboard_adminconsole_tsx_7e5c">Intermediate</option>
              <option value="advanced" data-icod-id="src_pages_dashboard_adminconsole_tsx_83e1">Advanced</option>
            </select>
          </Field>
          <Field
            label="Status"
            htmlFor="course-status"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_d1fd">
            <select
              id="course-status"
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
              value={formData.status || 'published'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              data-icod-id="src_pages_dashboard_adminconsole_tsx_d99c">
              <option value="draft" data-icod-id="src_pages_dashboard_adminconsole_tsx_7628">Draft</option>
              <option
                value="published"
                data-icod-id="src_pages_dashboard_adminconsole_tsx_6eaf">Published</option>
            </select>
          </Field>
        </div>
      </Modal>
    </div>
  );
}

// ─── Resources Tab ──────────────────────────────────────────────────────────────

/**
 * The public /resources page displays two sections:
 *   1. Downloadable resources from the API (seeded in DB)
 *   2. MG Blessed Beginnings Resource Library — 4 hardcoded external guides
 * The admin must show ALL of them so the two lists stay in sync.
 */
const MG_GUIDES_ADMIN = [
  { title: 'Free AI Tools Guide', type: 'guide', category: 'Resource Library', status: 'published' as const, downloadUrl: 'https://drive.google.com/file/d/1lUtcASlXnQUwieiOICzIlG0TNa--DAt8/view?usp=drivesdk', _mgGuide: true },
  { title: 'Canva Tips and Tutorials', type: 'guide', category: 'Resource Library', status: 'published' as const, downloadUrl: 'https://drive.google.com/file/d/1s4p30L4ldk67e8cZYKAjOivC2yyo_Tbk/view?usp=drivesdk', _mgGuide: true },
  { title: 'AI Marketing Guide', type: 'guide', category: 'Resource Library', status: 'published' as const, downloadUrl: 'https://drive.google.com/file/d/1X1alL1NTU2PX9b9MuNKncEs2_MCowODG/view?usp=drivesdk', _mgGuide: true },
  { title: 'Digital Safety Guide', type: 'guide', category: 'Resource Library', status: 'published' as const, downloadUrl: 'https://drive.google.com/file/d/1DNkABaawd_SqyzK3pOw2QsnMhtIHkQDc/view?usp=drivesdk', _mgGuide: true },
] as const;

function ResourcesTab() {
  const dispatch = useAppDispatch();
  const { resources, resourcesPagination, resourcesStatus } = useAppSelector((s: RootState) => s.admin);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceAdmin | null>(null);
  const [formData, setFormData] = useState<Partial<CreateResourceInput>>({
    title: '',
    slug: '',
    description: '',
    type: 'guide',
    downloadUrl: '',
    category: '',
    status: 'published',
  });

  useEffect(() => {
    if (resourcesStatus === 'idle') {
      dispatch(fetchResources({ limit: 20, offset: 0 }));
    }
  }, [dispatch, resourcesStatus]);

  // Combine DB resources with the 4 MG guides to match the public /resources page
  const allResources = [
    ...resources.map((r) => ({ ...r, _mgGuide: false as const })),
    ...MG_GUIDES_ADMIN.map((g) => ({ ...g, _id: `mg-${g.title}`, slug: '', description: '', downloadCount: 0 })),
  ];

  const handleSubmit = async () => {
    if (!formData.title || !formData.slug || !formData.downloadUrl || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingResource) {
      await dispatch(updateResourceThunk({ resourceId: editingResource._id, data: formData }));
    } else {
      await dispatch(createResourceThunk(formData as CreateResourceInput));
    }
    setModalOpen(false);
    setEditingResource(null);
    setFormData({ title: '', slug: '', description: '', type: 'guide', downloadUrl: '', category: '', status: 'published' });
  };

  const handleEdit = (resource: ResourceAdmin) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      slug: resource.slug,
      description: resource.description,
      type: resource.type,
      downloadUrl: resource.downloadUrl,
      category: resource.category,
      status: resource.status,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      await dispatch(deleteResourceThunk(id));
    }
  };

  if (resourcesStatus === 'loading') {
    return (
      <div
        className="flex justify-center py-12"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_a058"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_3763" /></div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4"
      data-icod-id="src_pages_dashboard_adminconsole_tsx_599b">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_ab56">
        <h3
          className="font-heading text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_fbcc">Resources ({allResources.length})</h3>
        <Button
          variant="primary"
          size="sm"
          onClick={() => { setEditingResource(null); setFormData({ title: '', slug: '', description: '', type: 'guide', downloadUrl: '', category: '', status: 'published' }); setModalOpen(true); }}
          data-icod-id="src_pages_dashboard_adminconsole_tsx_aa82">
          <Plus
            className="mr-2 h-4 w-4"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_8e90" /> Add Resource
        </Button>
      </div>
      {allResources.length === 0 ? (
        <EmptyState
          title="No resources"
          description="Create your first resource to get started."
          data-icod-id="src_pages_dashboard_adminconsole_tsx_a086" />
      ) : (
        <Card
          className="overflow-hidden"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_9909">
          <div
            className="overflow-x-auto"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_da2b">
            <table
              className="w-full text-left text-sm"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_03dc">
              <thead data-icod-id="src_pages_dashboard_adminconsole_tsx_4a87">
                <tr
                  className="border-b border-border bg-muted/30"
                  data-icod-id="src_pages_dashboard_adminconsole_tsx_95a1">
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_f162">Title</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_641e">Type</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_9963">Category</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_cbcf">Downloads</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_748d">Status</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground text-right"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_c059">Actions</th>
                </tr>
              </thead>
              <tbody data-icod-id="src_pages_dashboard_adminconsole_tsx_1793">
                {allResources.map((resource, idx) => (
                  <tr
                    key={resource._id || `mg-${idx}`}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    data-icod-id={`src_pages_dashboard_adminconsole_tsx_d8c2_${resource._id}`}>
                    <td
                      className="px-4 py-3 font-medium text-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_8f90_${resource._id}`}>{resource.title}</td>
                    <td
                      className="px-4 py-3 text-muted-foreground capitalize"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_dd62_${resource._id}`}>{resource.type}</td>
                    <td
                      className="px-4 py-3 text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_8a20_${resource._id}`}>{resource.category}</td>
                    <td
                      className="px-4 py-3 text-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_5a11_${resource._id}`}>{resource.downloadCount ?? '-'}</td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_5f92_${resource._id}`}>
                      <Badge
                        variant={(resource.status === 'published' ? 'ai' : 'default') as any}
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_8dc4_${resource._id}`}>{resource.status}</Badge>
                    </td>
                    <td
                      className="px-4 py-3 text-right"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_55a0_${resource._id}`}>
                      {!(resource as any)._mgGuide && (
                        <div
                          className="flex items-center justify-end gap-1"
                          data-icod-id={`src_pages_dashboard_adminconsole_tsx_a5c4_${resource._id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(resource as ResourceAdmin)}
                            data-icod-id={`src_pages_dashboard_adminconsole_tsx_23d8_${resource._id}`}>
                            <Edit
                              className="h-4 w-4"
                              data-icod-id={`src_pages_dashboard_adminconsole_tsx_1164_${resource._id}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete((resource as ResourceAdmin)._id)}
                            className="text-destructive hover:text-destructive"
                            data-icod-id={`src_pages_dashboard_adminconsole_tsx_9f90_${resource._id}`}>
                            <Trash2
                              className="h-4 w-4"
                              data-icod-id={`src_pages_dashboard_adminconsole_tsx_8c20_${resource._id}`} />
                          </Button>
                        </div>
                      )}
                      {(resource as any)._mgGuide && (
                        <span
                          className="text-xs text-muted-foreground italic"
                          data-icod-id={`src_pages_dashboard_adminconsole_tsx_7fa6_${idx}`}>External guide</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingResource ? 'Edit Resource' : 'Add Resource'}
        footer={
          <div
            className="flex gap-2 justify-end"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_8715">
            <Button
              variant="ghost"
              onClick={() => setModalOpen(false)}
              data-icod-id="src_pages_dashboard_adminconsole_tsx_39b1">Cancel</Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              data-icod-id="src_pages_dashboard_adminconsole_tsx_9036">{editingResource ? 'Update' : 'Create'}</Button>
          </div>
        }
        data-icod-id="src_pages_dashboard_adminconsole_tsx_a570">
        <div
          className="flex flex-col gap-4"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_badc">
          <Field
            label="Title"
            htmlFor="res-title"
            required
            data-icod-id="src_pages_dashboard_adminconsole_tsx_2818">
            <Input
              id="res-title"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              data-icod-id="src_pages_dashboard_adminconsole_tsx_f625" />
          </Field>
          <Field
            label="Slug"
            htmlFor="res-slug"
            required
            data-icod-id="src_pages_dashboard_adminconsole_tsx_636a">
            <Input
              id="res-slug"
              value={formData.slug || ''}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              data-icod-id="src_pages_dashboard_adminconsole_tsx_39d7" />
          </Field>
          <Field
            label="Description"
            htmlFor="res-desc"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_2391">
            <Input
              id="res-desc"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              data-icod-id="src_pages_dashboard_adminconsole_tsx_84c7" />
          </Field>
          <Field
            label="Type"
            htmlFor="res-type"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_edf4">
            <select
              id="res-type"
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
              value={formData.type || 'guide'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              data-icod-id="src_pages_dashboard_adminconsole_tsx_6e83">
              <option value="guide" data-icod-id="src_pages_dashboard_adminconsole_tsx_f6c2">Guide</option>
              <option value="template" data-icod-id="src_pages_dashboard_adminconsole_tsx_971e">Template</option>
              <option
                value="checklist"
                data-icod-id="src_pages_dashboard_adminconsole_tsx_91bd">Checklist</option>
              <option value="ebook" data-icod-id="src_pages_dashboard_adminconsole_tsx_d9b5">Ebook</option>
              <option
                value="worksheet"
                data-icod-id="src_pages_dashboard_adminconsole_tsx_460d">Worksheet</option>
            </select>
          </Field>
          <Field
            label="Download URL"
            htmlFor="res-url"
            required
            data-icod-id="src_pages_dashboard_adminconsole_tsx_59f9">
            <Input
              id="res-url"
              value={formData.downloadUrl || ''}
              onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
              data-icod-id="src_pages_dashboard_adminconsole_tsx_5ebb" />
          </Field>
          <Field
            label="Category"
            htmlFor="res-category"
            required
            data-icod-id="src_pages_dashboard_adminconsole_tsx_efe0">
            <Input
              id="res-category"
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              data-icod-id="src_pages_dashboard_adminconsole_tsx_5094" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

// ─── Referrals Tab ──────────────────────────────────────────────────────────────

function ReferralsTab() {
  const dispatch = useAppDispatch();
  const { referrals, referralsPagination, referralsStatus, referralStats, referralStatsStatus } = useAppSelector((s: RootState) => s.admin);

  useEffect(() => {
    if (referralsStatus === 'idle') {
      dispatch(fetchReferrals({ limit: 20, offset: 0 }));
    }
    if (referralStatsStatus === 'idle') {
      dispatch(fetchReferralStats());
    }
  }, [dispatch, referralsStatus, referralStatsStatus]);

  if (referralsStatus === 'loading') {
    return (
      <div
        className="flex justify-center py-12"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_01c5"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_9975" /></div>
    );
  }

  return (
    <div
      className="flex flex-col gap-6"
      data-icod-id="src_pages_dashboard_adminconsole_tsx_3ca5">
      {referralStats && (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_7b7f">
          <DashboardCard
            heading="Total Referrals"
            icon={<Gift
              className="h-5 w-5 text-primary"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_25ab" />}
            data-icod-id="src_pages_dashboard_adminconsole_tsx_856a">
            <span
              className="font-heading text-3xl font-bold text-foreground"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_76d7">{referralStats.totalReferrals}</span>
          </DashboardCard>
          <DashboardCard
            heading="Credits Awarded"
            icon={<TrendingUp
              className="h-5 w-5 text-success"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_5ecf" />}
            data-icod-id="src_pages_dashboard_adminconsole_tsx_0672">
            <span
              className="font-heading text-3xl font-bold text-success"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_8c04">{referralStats.totalCreditsAwarded}</span>
          </DashboardCard>
          <DashboardCard
            heading="Pending"
            icon={<Clock
              className="h-5 w-5 text-warning"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_cc10" />}
            data-icod-id="src_pages_dashboard_adminconsole_tsx_4fa7">
            <span
              className="font-heading text-3xl font-bold text-warning"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_3bc2">{referralStats.pendingCount}</span>
          </DashboardCard>
          <DashboardCard
            heading="Completed"
            icon={<CheckCircle2
              className="h-5 w-5 text-success"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_5588" />}
            data-icod-id="src_pages_dashboard_adminconsole_tsx_d8c1">
            <span
              className="font-heading text-3xl font-bold text-success"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_5656">{referralStats.completedCount}</span>
          </DashboardCard>
        </div>
      )}
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_c8e9">
        <h3
          className="font-heading text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_322d">Referrals ({referralsPagination?.total ?? referrals.length})</h3>
      </div>
      {referrals.length === 0 ? (
        <EmptyState
          title="No referrals"
          description="No referrals found."
          data-icod-id="src_pages_dashboard_adminconsole_tsx_ebc8" />
      ) : (
        <Card
          className="overflow-hidden"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_a9a9">
          <div
            className="overflow-x-auto"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_6f74">
            <table
              className="w-full text-left text-sm"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_c11b">
              <thead data-icod-id="src_pages_dashboard_adminconsole_tsx_6d34">
                <tr
                  className="border-b border-border bg-muted/30"
                  data-icod-id="src_pages_dashboard_adminconsole_tsx_ca4a">
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_96cd">Referrer</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_574b">Referred User</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_499c">Status</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_0d77">Credits</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_1d5e">Date</th>
                </tr>
              </thead>
              <tbody data-icod-id="src_pages_dashboard_adminconsole_tsx_e431">
                {referrals.map((ref) => (
                  <tr
                    key={ref._id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    data-icod-id={`src_pages_dashboard_adminconsole_tsx_c009_${ref._id}`}>
                    <td
                      className="px-4 py-3 font-medium text-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_8cdb_${ref._id}`}>
                      {typeof ref.referrer === 'object' ? (ref.referrer as any).email : ref.referrer}
                    </td>
                    <td
                      className="px-4 py-3 text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_14f7_${ref._id}`}>
                      {typeof ref.referred === 'object' ? (ref.referred as any).email : ref.referred}
                    </td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_df4c_${ref._id}`}>
                      <Badge
                        variant={(ref.status === 'completed' ? 'ai' : 'new') as any}
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_6701_${ref._id}`}>{ref.status}</Badge>
                    </td>
                    <td
                      className="px-4 py-3 text-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_16f5_${ref._id}`}>{ref.creditsAwarded}</td>
                    <td
                      className="px-4 py-3 text-muted-foreground text-xs"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_19a5_${ref._id}`}>
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── AI Visibility Tab ──────────────────────────────────────────────────────────

function AIVisibilityTab() {
  const dispatch = useAppDispatch();
  const { aiVisibilityRecords, aiVisibilityPagination, aiVisibilityStatus } = useAppSelector((s: RootState) => s.admin);

  useEffect(() => {
    if (aiVisibilityStatus === 'idle') {
      dispatch(fetchAIVisibilityRecords({ limit: 20, offset: 0 }));
    }
  }, [dispatch, aiVisibilityStatus]);

  if (aiVisibilityStatus === 'loading') {
    return (
      <div
        className="flex justify-center py-12"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_4621"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_8b61" /></div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4"
      data-icod-id="src_pages_dashboard_adminconsole_tsx_8516">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_0ebc">
        <h3
          className="font-heading text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_5e4f">AI Visibility Records ({aiVisibilityPagination?.total ?? aiVisibilityRecords.length})</h3>
      </div>
      {aiVisibilityRecords.length === 0 ? (
        <EmptyState
          title="No records"
          description="No AI visibility records found."
          data-icod-id="src_pages_dashboard_adminconsole_tsx_2bdb" />
      ) : (
        <Card
          className="overflow-hidden"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_b2f1">
          <div
            className="overflow-x-auto"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_b9b2">
            <table
              className="w-full text-left text-sm"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_8200">
              <thead data-icod-id="src_pages_dashboard_adminconsole_tsx_71e5">
                <tr
                  className="border-b border-border bg-muted/30"
                  data-icod-id="src_pages_dashboard_adminconsole_tsx_f67a">
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_ca5a">Project</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_c255">Platform</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_e28a">Mentioned</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_d445">Confidence</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_579d">Context</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_7535">Date</th>
                </tr>
              </thead>
              <tbody data-icod-id="src_pages_dashboard_adminconsole_tsx_2ebc">
                {aiVisibilityRecords.map((record) => (
                  <tr
                    key={record._id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    data-icod-id={`src_pages_dashboard_adminconsole_tsx_22a4_${record._id}`}>
                    <td
                      className="px-4 py-3 font-medium text-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_07c9_${record._id}`}>
                      {typeof record.projectId === 'object' ? (record.projectId as any).name : record.projectId}
                    </td>
                    <td
                      className="px-4 py-3 text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_f87f_${record._id}`}>{record.platform}</td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_b2c4_${record._id}`}>
                      {record.brandMentioned ? (
                        <CheckCircle2
                          className="h-4 w-4 text-success"
                          data-icod-id={`src_pages_dashboard_adminconsole_tsx_e453_${record._id}`} />
                      ) : (
                        <XCircle
                          className="h-4 w-4 text-muted-foreground"
                          data-icod-id={`src_pages_dashboard_adminconsole_tsx_f43a_${record._id}`} />
                      )}
                    </td>
                    <td
                      className="px-4 py-3 text-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_137d_${record._id}`}>{record.confidence}%</td>
                    <td
                      className="px-4 py-3 text-muted-foreground line-clamp-1 max-w-[200px]"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_b370_${record._id}`}>{record.mentionContext}</td>
                    <td
                      className="px-4 py-3 text-muted-foreground text-xs"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_98c9_${record._id}`}>
                      {new Date(record.checkedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Competitor Audits Tab ──────────────────────────────────────────────────────

function CompetitorAuditsTab() {
  const dispatch = useAppDispatch();
  const { competitorAudits, competitorAuditsPagination, competitorAuditsStatus } = useAppSelector((s: RootState) => s.admin);

  useEffect(() => {
    if (competitorAuditsStatus === 'idle') {
      dispatch(fetchCompetitorAudits({ limit: 20, offset: 0 }));
    }
  }, [dispatch, competitorAuditsStatus]);

  if (competitorAuditsStatus === 'loading') {
    return (
      <div
        className="flex justify-center py-12"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_cf40"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_18e3" /></div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4"
      data-icod-id="src_pages_dashboard_adminconsole_tsx_3478">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_eaa6">
        <h3
          className="font-heading text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_848e">Competitor Audits ({competitorAuditsPagination?.total ?? competitorAudits.length})</h3>
      </div>
      {competitorAudits.length === 0 ? (
        <EmptyState
          title="No competitor audits"
          description="No competitor audits found."
          data-icod-id="src_pages_dashboard_adminconsole_tsx_af3f" />
      ) : (
        <Card
          className="overflow-hidden"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_acb9">
          <div
            className="overflow-x-auto"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_0d46">
            <table
              className="w-full text-left text-sm"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_2e41">
              <thead data-icod-id="src_pages_dashboard_adminconsole_tsx_60be">
                <tr
                  className="border-b border-border bg-muted/30"
                  data-icod-id="src_pages_dashboard_adminconsole_tsx_ce82">
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_bcbe">Project</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_c19f">Competitor URL</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_9bb3">Status</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_72d5">SEO</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_f8bb">AEO</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_d55b">Date</th>
                </tr>
              </thead>
              <tbody data-icod-id="src_pages_dashboard_adminconsole_tsx_e827">
                {(Array.isArray(competitorAudits) ? competitorAudits : []).map((audit) => {
                  if (!audit) return null;
                  const projectName = audit.projectId && typeof audit.projectId === 'object'
                    ? ((audit.projectId as any)?.name ?? '—')
                    : (audit.projectId ?? '—');
                  return (
                    <tr
                      key={audit._id}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_e871_${audit._id}`}>
                      <td
                        className="px-4 py-3 font-medium text-foreground"
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_27c9_${audit._id}`}>
                        {projectName}
                      </td>
                      <td
                        className="px-4 py-3 text-muted-foreground font-mono text-xs truncate max-w-[200px]"
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_bde2_${audit._id}`}>{audit.competitorUrl ?? '—'}</td>
                      <td
                        className="px-4 py-3"
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_7954_${audit._id}`}>
                        <Badge
                          variant={(audit.status === 'completed' ? 'ai' : audit.status === 'failed' ? 'default' : 'new') as any}
                          data-icod-id={`src_pages_dashboard_adminconsole_tsx_484d_${audit._id}`}>
                          {audit.status ?? 'unknown'}
                        </Badge>
                      </td>
                      <td
                        className="px-4 py-3 text-foreground"
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_517b_${audit._id}`}>{audit.scores?.seo ?? 0}%</td>
                      <td
                        className="px-4 py-3 text-foreground"
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_1fe1_${audit._id}`}>{audit.scores?.aeo ?? 0}%</td>
                      <td
                        className="px-4 py-3 text-muted-foreground text-xs"
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_7f93_${audit._id}`}>
                        {audit.createdAt ? new Date(audit.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Backlink Opportunities Tab ─────────────────────────────────────────────────

function BacklinkOpportunitiesTab() {
  const dispatch = useAppDispatch();
  const { backlinkOpportunities, backlinkOpportunitiesPagination, backlinkOpportunitiesStatus } = useAppSelector((s: RootState) => s.admin);

  useEffect(() => {
    if (backlinkOpportunitiesStatus === 'idle') {
      dispatch(fetchBacklinkOpportunities({ limit: 20, offset: 0 }));
    }
  }, [dispatch, backlinkOpportunitiesStatus]);

  const handleStatusChange = async (id: string, status: string) => {
    await dispatch(updateBacklinkOpportunityThunk({ opportunityId: id, data: { status } }));
  };

  if (backlinkOpportunitiesStatus === 'loading') {
    return (
      <div
        className="flex justify-center py-12"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_2873"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_241b" /></div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4"
      data-icod-id="src_pages_dashboard_adminconsole_tsx_73f8">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_8cc0">
        <h3
          className="font-heading text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_2dc0">Backlink Opportunities ({backlinkOpportunitiesPagination?.total ?? backlinkOpportunities.length})</h3>
      </div>
      {backlinkOpportunities.length === 0 ? (
        <EmptyState
          title="No opportunities"
          description="No backlink opportunities found."
          data-icod-id="src_pages_dashboard_adminconsole_tsx_f99b" />
      ) : (
        <Card
          className="overflow-hidden"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_6a69">
          <div
            className="overflow-x-auto"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_555a">
            <table
              className="w-full text-left text-sm"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_7eeb">
              <thead data-icod-id="src_pages_dashboard_adminconsole_tsx_6f48">
                <tr
                  className="border-b border-border bg-muted/30"
                  data-icod-id="src_pages_dashboard_adminconsole_tsx_daaf">
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_cf4f">Source</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_651f">Type</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_6cc2">Status</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_6dc0">DA</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_2c00">Broken</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground text-right"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_0321">Actions</th>
                </tr>
              </thead>
              <tbody data-icod-id="src_pages_dashboard_adminconsole_tsx_b61e">
                {backlinkOpportunities.map((opp) => (
                  <tr
                    key={opp._id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    data-icod-id={`src_pages_dashboard_adminconsole_tsx_6ef3_${opp._id}`}>
                    <td
                      className="px-4 py-3 font-medium text-foreground truncate max-w-[200px]"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_b02a_${opp._id}`}>{opp.sourceUrl}</td>
                    <td
                      className="px-4 py-3 text-muted-foreground capitalize"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_047e_${opp._id}`}>{opp.type.replace('-', ' ')}</td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_e008_${opp._id}`}>
                      <select
                        className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground"
                        value={opp.status}
                        onChange={(e) => handleStatusChange(opp._id, e.target.value)}
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_7bd8_${opp._id}`}>
                        <option
                          value="discovered"
                          data-icod-id={`src_pages_dashboard_adminconsole_tsx_967e_${opp._id}`}>Discovered</option>
                        <option
                          value="contacted"
                          data-icod-id={`src_pages_dashboard_adminconsole_tsx_48a5_${opp._id}`}>Contacted</option>
                        <option
                          value="acquired"
                          data-icod-id={`src_pages_dashboard_adminconsole_tsx_e0c3_${opp._id}`}>Acquired</option>
                      </select>
                    </td>
                    <td
                      className="px-4 py-3 text-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_5e81_${opp._id}`}>{opp.domainAuthority ?? '-'}</td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_22ab_${opp._id}`}>
                      {opp.isBroken ? <AlertTriangle
                        className="h-4 w-4 text-warning"
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_6d2b_${opp._id}`} /> : <CheckCircle2
                        className="h-4 w-4 text-success"
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_f81f_${opp._id}`} />}
                    </td>
                    <td
                      className="px-4 py-3 text-right"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_0be0_${opp._id}`}>
                      <a
                        href={opp.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-xs"
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_3a85_${opp._id}`}>
                        Visit
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Content Gaps Tab ───────────────────────────────────────────────────────────

function ContentGapsTab() {
  const dispatch = useAppDispatch();
  const { contentGaps, contentGapsPagination, contentGapsStatus } = useAppSelector((s: RootState) => s.admin);

  useEffect(() => {
    if (contentGapsStatus === 'idle') {
      dispatch(fetchContentGaps({ limit: 20, offset: 0 }));
    }
  }, [dispatch, contentGapsStatus]);

  if (contentGapsStatus === 'loading') {
    return (
      <div
        className="flex justify-center py-12"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_829a"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_1fb4" /></div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4"
      data-icod-id="src_pages_dashboard_adminconsole_tsx_694f">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_6ba6">
        <h3
          className="font-heading text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_75f9">Content Gaps ({contentGapsPagination?.total ?? contentGaps.length})</h3>
      </div>
      {contentGaps.length === 0 ? (
        <EmptyState
          title="No content gaps"
          description="No content gaps found."
          data-icod-id="src_pages_dashboard_adminconsole_tsx_d619" />
      ) : (
        <Card
          className="overflow-hidden"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_5044">
          <div
            className="overflow-x-auto"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_01c8">
            <table
              className="w-full text-left text-sm"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_db34">
              <thead data-icod-id="src_pages_dashboard_adminconsole_tsx_7b51">
                <tr
                  className="border-b border-border bg-muted/30"
                  data-icod-id="src_pages_dashboard_adminconsole_tsx_e222">
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_9381">Topic</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_96dd">Priority</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_921d">Intent</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_cdd0">Keyword</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_cf33">Questions</th>
                </tr>
              </thead>
              <tbody data-icod-id="src_pages_dashboard_adminconsole_tsx_11ef">
                {contentGaps.map((gap) => (
                  <tr
                    key={gap._id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    data-icod-id={`src_pages_dashboard_adminconsole_tsx_cff3_${gap._id}`}>
                    <td
                      className="px-4 py-3 font-medium text-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_1ec8_${gap._id}`}>{gap.topic}</td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_9c86_${gap._id}`}>
                      <Badge
                        variant={(gap.priority === 'high' ? 'default' : gap.priority === 'medium' ? 'new' : 'category') as any}
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_54e3_${gap._id}`}>
                        {gap.priority}
                      </Badge>
                    </td>
                    <td
                      className="px-4 py-3 text-muted-foreground capitalize"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_0683_${gap._id}`}>{gap.searchIntent}</td>
                    <td
                      className="px-4 py-3 text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_c98e_${gap._id}`}>{gap.primaryKeyword}</td>
                    <td
                      className="px-4 py-3 text-muted-foreground text-xs"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_855d_${gap._id}`}>{gap.questions.length} questions</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Keyword Gaps Tab ───────────────────────────────────────────────────────────

function KeywordGapsTab() {
  const dispatch = useAppDispatch();
  const { keywordGaps, keywordGapsPagination, keywordGapsStatus } = useAppSelector((s: RootState) => s.admin);

  useEffect(() => {
    if (keywordGapsStatus === 'idle') {
      dispatch(fetchKeywordGaps({ limit: 20, offset: 0 }));
    }
  }, [dispatch, keywordGapsStatus]);

  if (keywordGapsStatus === 'loading') {
    return (
      <div
        className="flex justify-center py-12"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_0f20"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_24cf" /></div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4"
      data-icod-id="src_pages_dashboard_adminconsole_tsx_776b">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_e3b7">
        <h3
          className="font-heading text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_f043">Keyword Gaps ({keywordGapsPagination?.total ?? keywordGaps.length})</h3>
      </div>
      {keywordGaps.length === 0 ? (
        <EmptyState
          title="No keyword gaps"
          description="No keyword gaps found."
          data-icod-id="src_pages_dashboard_adminconsole_tsx_8126" />
      ) : (
        <Card
          className="overflow-hidden"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_d0c7">
          <div
            className="overflow-x-auto"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_aa0a">
            <table
              className="w-full text-left text-sm"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_0f1a">
              <thead data-icod-id="src_pages_dashboard_adminconsole_tsx_3af5">
                <tr
                  className="border-b border-border bg-muted/30"
                  data-icod-id="src_pages_dashboard_adminconsole_tsx_26ca">
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_da5a">Keyword</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_f420">Volume</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_422b">Difficulty</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_a6a1">Opportunity</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_6d41">Category</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_94d8">Your Position</th>
                </tr>
              </thead>
              <tbody data-icod-id="src_pages_dashboard_adminconsole_tsx_1f30">
                {keywordGaps.map((gap) => (
                  <tr
                    key={gap._id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    data-icod-id={`src_pages_dashboard_adminconsole_tsx_2ba2_${gap._id}`}>
                    <td
                      className="px-4 py-3 font-medium text-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_9fc1_${gap._id}`}>{gap.keyword}</td>
                    <td
                      className="px-4 py-3 text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_87b1_${gap._id}`}>{gap.searchVolume?.toLocaleString() ?? '-'}</td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_5da5_${gap._id}`}>
                      <span
                        className={cn(
                          'font-semibold',
                          gap.difficulty > 70 ? 'text-destructive' : gap.difficulty > 40 ? 'text-warning' : 'text-success'
                        )}
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_b264_${gap._id}`}>
                        {gap.difficulty}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_78e6_${gap._id}`}>
                      <span
                        className={cn(
                          'font-semibold',
                          gap.opportunity > 70 ? 'text-success' : gap.opportunity > 40 ? 'text-warning' : 'text-muted-foreground'
                        )}
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_5dce_${gap._id}`}>
                        {gap.opportunity}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-muted-foreground capitalize"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_44d5_${gap._id}`}>{gap.category}</td>
                    <td
                      className="px-4 py-3 text-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_d0a9_${gap._id}`}>{gap.yourPosition ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Newsletter Tab ─────────────────────────────────────────────────────────────

function NewsletterTab() {
  const dispatch = useAppDispatch();
  const { newsletterSubscribers, newsletterSubscribersPagination, newsletterSubscribersStatus } = useAppSelector((s: RootState) => s.admin);

  useEffect(() => {
    if (newsletterSubscribersStatus === 'idle') {
      dispatch(fetchNewsletterSubscribers({ limit: 20, offset: 0 }));
    }
  }, [dispatch, newsletterSubscribersStatus]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    await dispatch(updateNewsletterSubscriberThunk({ subscriberId: id, data: { isActive: !currentStatus } }));
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this subscriber?')) {
      await dispatch(deleteNewsletterSubscriberThunk(id));
    }
  };

  const handleExport = async () => {
    try {
      const blob = await adminApiService.exportNewsletterSubscribers();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'newsletter-subscribers.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (newsletterSubscribersStatus === 'loading') {
    return (
      <div
        className="flex justify-center py-12"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_3ada"><Spinner size="lg" data-icod-id="src_pages_dashboard_adminconsole_tsx_e17e" /></div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4"
      data-icod-id="src_pages_dashboard_adminconsole_tsx_355a">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_adminconsole_tsx_f54b">
        <h3
          className="font-heading text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_9cec">Newsletter & Notifications ({newsletterSubscribersPagination?.total ?? newsletterSubscribers.length})</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          data-icod-id="src_pages_dashboard_adminconsole_tsx_3d91">
          <Download
            className="mr-2 h-4 w-4"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_9137" /> Export CSV
        </Button>
      </div>
      {newsletterSubscribers.length === 0 ? (
        <EmptyState
          title="No subscribers"
          description="No newsletter subscribers found."
          data-icod-id="src_pages_dashboard_adminconsole_tsx_2d2c" />
      ) : (
        <Card
          className="overflow-hidden"
          data-icod-id="src_pages_dashboard_adminconsole_tsx_a3fd">
          <div
            className="overflow-x-auto"
            data-icod-id="src_pages_dashboard_adminconsole_tsx_29d3">
            <table
              className="w-full text-left text-sm"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_162d">
              <thead data-icod-id="src_pages_dashboard_adminconsole_tsx_a246">
                <tr
                  className="border-b border-border bg-muted/30"
                  data-icod-id="src_pages_dashboard_adminconsole_tsx_1810">
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_8743">Email</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_0be1">Source</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_82ff">Status</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_066b">Subscribed</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground text-right"
                    data-icod-id="src_pages_dashboard_adminconsole_tsx_ac2d">Actions</th>
                </tr>
              </thead>
              <tbody data-icod-id="src_pages_dashboard_adminconsole_tsx_0fd2">
                {newsletterSubscribers.map((sub) => (
                  <tr
                    key={sub._id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    data-icod-id={`src_pages_dashboard_adminconsole_tsx_945e_${sub._id}`}>
                    <td
                      className="px-4 py-3 font-medium text-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_e5dd_${sub._id}`}>{sub.email}</td>
                    <td
                      className="px-4 py-3 text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_835c_${sub._id}`}>{sub.source || '-'}</td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_d05c_${sub._id}`}>
                      <Badge
                        variant={(sub.isActive ? 'ai' : 'default') as any}
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_2ce3_${sub._id}`}>{sub.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td
                      className="px-4 py-3 text-muted-foreground text-xs"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_da10_${sub._id}`}>
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                    <td
                      className="px-4 py-3 text-right"
                      data-icod-id={`src_pages_dashboard_adminconsole_tsx_6aaa_${sub._id}`}>
                      <div
                        className="flex items-center justify-end gap-1"
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_50a0_${sub._id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(sub._id, sub.isActive)}
                          data-icod-id={`src_pages_dashboard_adminconsole_tsx_50c7_${sub._id}`}>
                          {sub.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(sub._id)}
                          className="text-destructive hover:text-destructive"
                          data-icod-id={`src_pages_dashboard_adminconsole_tsx_8723_${sub._id}`}>
                          <Trash2
                            className="h-4 w-4"
                            data-icod-id={`src_pages_dashboard_adminconsole_tsx_8e15_${sub._id}`} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Videos Tab ──────────────────────────────────────────────────────────────

interface VideoEntry {
  id: string;
  title: string;
  location: string;
  driveId: string;
}

const INITIAL_VIDEOS: VideoEntry[] = [
  { id: 'v1', title: 'Watch: MG Blessed Beginnings in 30 seconds', location: 'Homepage', driveId: '1IVfYrTOT2q59ACHawHXQRG7Sn30f5zUx' },
  { id: 'v2', title: 'AI-Powered Business Toolkit', location: 'Tutorials section', driveId: '1M57RHp2dMod2H-rm-EkXLizazB5s9xab' },
  { id: 'v3', title: 'Tutorial 2', location: 'Tutorials section', driveId: '1Q-9LzwlApL_74zrVGUCDTtTPllHQb-op' },
  { id: 'v4', title: 'Tutorial 3', location: 'Tutorials section', driveId: '1z00iU_O4I2R1RM_593bkRiBCRH5sSl6Y' },
  { id: 'v5', title: 'Tutorial 4', location: 'Tutorials section', driveId: '1rGWxiKwtAqkX1fqPtW0zQY-1gHMns19E' },
  { id: 'v6', title: 'Tutorial 5', location: 'Tutorials section', driveId: '1G9juHbzhdXnSCLm-X-4yI3H1TiFbhIaJ' },
  { id: 'v7', title: 'Episode 1', location: 'Episode Scripts', driveId: '1WIzjjZ5h6W5wHzfdPSiKyobzGfvCYZn' },
  { id: 'v8', title: 'Episode 2', location: 'Episode Scripts', driveId: '1-d4ENPvZQoNZRpHwHmMwVeLf-UQQNlXA' },
  { id: 'v9', title: 'Episode 3', location: 'Episode Scripts', driveId: '1gKhODEyQye8_0eNXbuR8vi8NN6fMyEuG' },
  { id: 'v10', title: 'Episode 4', location: 'Episode Scripts', driveId: '1hVZikx0WoTdZQunEfOz7O7SPxHbXklKh' },
  { id: 'v11', title: 'Episode 5', location: 'Episode Scripts', driveId: '1zKMTaLT31p9qw13GBhymDJX4noXsESoe' },
  { id: 'v12', title: 'Episode 6', location: 'Episode Scripts', driveId: '1tGo1ZOtXpzNPwolewrYzCAG5xMwQ1Tl6' },
  { id: 'v13', title: '100 People Tested My AI App', location: 'Episode Scripts', driveId: '1qZWCUWapSLZCo7iTh8DPfx0DjNxtExRA' },
];

function VideosTab() {
  const [videos, setVideos] = useState<VideoEntry[]>(INITIAL_VIDEOS);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoEntry | null>(null);
  const [editDriveId, setEditDriveId] = useState('');

  const handleEditClick = (video: VideoEntry) => {
    setEditingVideo(video);
    setEditDriveId(video.driveId);
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingVideo || !editDriveId.trim()) return;
    setVideos((prev) =>
      prev.map((v) =>
        v.id === editingVideo.id ? { ...v, driveId: editDriveId.trim() } : v,
      ),
    );
    setEditModalOpen(false);
    setEditingVideo(null);
    setEditDriveId('');
  };

  return (
    <div className="flex flex-col gap-4" data-icod-id="admin_videos_root">
      <div className="flex items-center justify-between" data-icod-id="admin_videos_header">
        <h3 className="font-heading text-lg font-semibold text-foreground" data-icod-id="admin_videos_title">
          Videos / Media ({videos.length})
        </h3>
      </div>
      <Card className="overflow-hidden" data-icod-id="admin_videos_table_card">
        <div className="overflow-x-auto" data-icod-id="admin_videos_table_wrap">
          <table className="w-full text-left text-sm" data-icod-id="admin_videos_table">
            <thead data-icod-id="admin_videos_thead">
              <tr className="border-b border-border bg-muted/30" data-icod-id="admin_videos_header_row">
                <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_videos_th_title">Video Title</th>
                <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_videos_th_location">Page / Section</th>
                <th className="px-4 py-3 font-semibold text-foreground" data-icod-id="admin_videos_th_preview">Drive Preview</th>
                <th className="px-4 py-3 font-semibold text-foreground text-right" data-icod-id="admin_videos_th_actions">Actions</th>
              </tr>
            </thead>
            <tbody data-icod-id="admin_videos_tbody">
              {videos.map((video) => (
                <tr
                  key={video.id}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  data-icod-id={`admin_videos_row_${video.id}`}>
                  <td className="px-4 py-3 font-medium text-foreground" data-icod-id={`admin_videos_title_${video.id}`}>
                    {video.title}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground" data-icod-id={`admin_videos_location_${video.id}`}>
                    {video.location}
                  </td>
                  <td className="px-4 py-3" data-icod-id={`admin_videos_preview_${video.id}`}>
                    <a
                      href={`https://drive.google.com/file/d/${video.driveId}/preview`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                      data-icod-id={`admin_videos_link_${video.id}`}>
                      <ExternalLink
                        className="h-3 w-3"
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_6069_${video.id}`} />
                      Preview
                    </a>
                  </td>
                  <td className="px-4 py-3 text-right" data-icod-id={`admin_videos_actions_${video.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(video)}
                      aria-label={`Edit ${video.title}`}
                      data-icod-id={`admin_videos_edit_${video.id}`}>
                      <Edit
                        className="h-4 w-4"
                        data-icod-id={`src_pages_dashboard_adminconsole_tsx_da9b_${video.id}`} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {/* Edit Drive ID Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={editingVideo ? `Edit Drive ID — ${editingVideo.title}` : 'Edit Drive ID'}
        footer={
          <div className="flex gap-2 justify-end" data-icod-id="admin_videos_edit_modal_footer">
            <Button variant="ghost" onClick={() => setEditModalOpen(false)} data-icod-id="admin_videos_edit_cancel">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEdit} data-icod-id="admin_videos_edit_save">
              Save
            </Button>
          </div>
        }
        data-icod-id="admin_videos_edit_modal">
        <div className="flex flex-col gap-4" data-icod-id="admin_videos_edit_form">
          {editingVideo && (
            <p className="text-sm text-muted-foreground" data-icod-id="admin_videos_edit_desc">
              Update the Google Drive file ID for <strong
              className="text-foreground"
              data-icod-id="src_pages_dashboard_adminconsole_tsx_68e5">{editingVideo.title}</strong> ({editingVideo.location}).
            </p>
          )}
          <Field label="Google Drive File ID" htmlFor="video-drive-id" required data-icod-id="admin_videos_edit_field">
            <Input
              id="video-drive-id"
              value={editDriveId}
              onChange={(e) => setEditDriveId(e.target.value)}
              placeholder="e.g. 1IVfYrTOT2q59ACHawHXQRG7Sn30f5zUx"
              data-icod-id="admin_videos_edit_input" />
          </Field>
          {editDriveId && (
            <div className="rounded-md border border-border/60 bg-muted/20 p-3" data-icod-id="admin_videos_edit_preview_wrap">
              <p className="mb-2 text-xs font-medium text-muted-foreground" data-icod-id="admin_videos_edit_preview_label">Preview link:</p>
              <a
                href={`https://drive.google.com/file/d/${editDriveId}/preview`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline break-all"
                data-icod-id="admin_videos_edit_preview_link">
                https://drive.google.com/file/d/{editDriveId}/preview
              </a>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
