import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Users,
  Key,
  Link2,
  FileText,
  Eye,
  Lightbulb,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  ChevronDown,
  Check,
  LogOut,
  FolderOpen,
  Brain,
  Code2,
  Zap,
  Smartphone,
  MapPin,
  Shield,
  Accessibility,
  Share2,
  Sparkles,
  BookOpen,
  Activity,
  ShoppingCart,
  Rocket,
  Globe,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui';
import SEOHead from '@/components/SEOHead';
import CreateProjectModal from '@/components/dashboard/CreateProjectModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProjects, setCurrentProject } from '@/store/slices/projectsSlice';
import { logout } from '@/store/slices/authSlice';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Intelligence Hub',
    items: [
      { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
      { label: 'AI Center', path: '/dashboard/ai-center', icon: Sparkles },
      { label: 'Website Intel', path: '/dashboard/website-intel', icon: Globe },
      { label: 'Security Center', path: '/dashboard/security-center', icon: Shield },
      { label: 'E-commerce Intel', path: '/dashboard/ecommerce-intel', icon: ShoppingCart },
      { label: 'Business Growth', path: '/dashboard/business-growth', icon: Rocket },
    ],
  },
  {
    title: 'SEO & Content',
    items: [
      { label: 'SEO Audit', path: '/dashboard/audits', icon: Search },
      { label: 'Keywords', path: '/dashboard/keywords', icon: Key },
      { label: 'Competitors', path: '/dashboard/competitors', icon: Users },
      { label: 'Content', path: '/dashboard/content', icon: FileText },
      { label: 'Backlinks', path: '/dashboard/backlinks', icon: Link2 },
      { label: 'AEO/AI Search', path: '/dashboard/aeo-audit', icon: Brain },
      { label: 'Schema', path: '/dashboard/schema', icon: Code2 },
    ],
  },
  {
    title: 'Performance',
    items: [
      { label: 'Performance', path: '/dashboard/performance', icon: Zap },
      { label: 'Mobile', path: '/dashboard/mobile', icon: Smartphone },
      { label: 'Accessibility', path: '/dashboard/accessibility', icon: Accessibility },
      { label: 'Social', path: '/dashboard/social', icon: Share2 },
      { label: 'Local SEO', path: '/dashboard/local-seo', icon: MapPin },
      { label: 'Search Perf.', path: '/dashboard/search-performance', icon: Activity },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Projects', path: '/dashboard/projects', icon: FolderOpen },
      { label: 'Reports', path: '/dashboard/reports', icon: BarChart3 },
      { label: 'Recommendations', path: '/dashboard/recommendations', icon: Lightbulb },
      { label: 'AI Tools', path: '/ai-tools', icon: Sparkles },
      { label: 'Admin Console', path: '/dashboard/admin-console', icon: ShieldCheck },
      { label: 'Settings', path: '/dashboard/settings', icon: Settings },
    ],
  },
];

// Flatten for backward compatibility (used by role filtering)
const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

const ADMIN_ONLY_NAV: NavItem[] = [];

interface Project {
  _id: string;
  name: string;
}

/**
 * Premium Dashboard shell with responsive sidebar, glass top bar, and main content area.
 * Sidebar has dark gradient background with active item glow effects.
 */
export default function DashboardLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: projects, currentProjectId } = useAppSelector((s) => s.projects);
  const user = useAppSelector((s) => s.auth.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch projects on mount
  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const selectedProject = projects.find((p) => p._id === currentProjectId) || null;

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close project dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProjectDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'MY';

  const userRole = user?.role || 'viewer';
  // Filter nav groups based on role — non-admin users don't see Settings or Admin Console
  const ADMIN_ONLY_PATHS = ['/dashboard/settings', '/dashboard/admin-console'];
  const visibleNavGroups: NavGroup[] = userRole === 'admin'
    ? NAV_GROUPS
    : NAV_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) => !ADMIN_ONLY_PATHS.includes(item.path)),
      })).filter((group) => group.items.length > 0);

  return (
    <div className="flex h-screen w-full bg-background" data-icod-id="dashboard_layout_root">
      <SEOHead
        title="Dashboard — MG Blessed Beginnings"
        description="Manage your projects, audits, and business intelligence from your dashboard."
        canonicalUrl="/dashboard"
        noindex
        data-icod-id="src_components_dashboard_dashboardlayout_tsx_seo" />
      {/* Mobile backdrop overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm xl:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
          data-icod-id="src_components_dashboard_dashboardlayout_tsx_0952" />
      )}
      {/* Premium Sidebar — dark theme background */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
          'w-[260px]',
          'md:w-[72px] md:items-center',
          'xl:w-[260px] xl:items-stretch',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0',
          'bg-background border-r border-border',
        )}
        data-icod-id="src_components_dashboard_dashboardlayout_tsx_b60d">
        
        {/* Brand / Logo area */}
        <div
          className="flex h-16 items-center gap-3 border-b border-border px-4 md:justify-center xl:justify-start xl:px-5"
          data-icod-id="src_components_dashboard_dashboardlayout_tsx_9051">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(109,0,217,0.4)]"
            data-icod-id="src_components_dashboard_dashboardlayout_tsx_810e">
            <Eye className="h-5 w-5" data-icod-id="src_components_dashboard_dashboardlayout_tsx_a066" />
          </div>
          <span
            className="font-heading text-sm font-bold text-foreground md:hidden xl:block tracking-tight"
            data-icod-id="src_components_dashboard_dashboardlayout_tsx_4f70">
            MG Business Intelligence
          </span>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="ml-auto text-muted-foreground hover:text-primary-hover md:hidden transition-colors"
            aria-label="Close menu"
            data-icod-id="src_components_dashboard_dashboardlayout_tsx_b56e">
            <X className="h-5 w-5" data-icod-id="src_components_dashboard_dashboardlayout_tsx_bca7" />
          </button>
        </div>

        {/* Navigation — grouped sections with left accent bar for active */}
        <nav
          className="flex-1 overflow-y-auto px-3 py-4 md:px-2 xl:px-3"
          data-icod-id="src_components_dashboard_dashboardlayout_tsx_5fb9">
          <div className="flex flex-col gap-5" data-icod-id="src_components_dashboard_dashboardlayout_tsx_nav_groups">
            {visibleNavGroups.map((group) => (
              <div key={group.title} data-icod-id={`src_components_dashboard_dashboardlayout_tsx_group_${group.title}`}>
                {/* Group label — visible on expanded sidebar only */}
                <p
                  className="mb-1.5 hidden px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 xl:block"
                  data-icod-id={`src_components_dashboard_dashboardlayout_tsx_group_label_${group.title}`}>
                  {group.title}
                </p>
                <ul
                  className="flex flex-col gap-0.5"
                  data-icod-id={`src_components_dashboard_dashboardlayout_tsx_group_list_${group.title}`}>
                  {group.items.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <li
                        key={item.path}
                        data-icod-id={`src_components_dashboard_dashboardlayout_tsx_1051_${item.path}`}>
                        <NavLink
                          to={item.path}
                          className={cn(
                            'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-[300ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                            active
                              ? 'bg-primary/15 text-primary-hover'
                              : 'text-muted-foreground hover:bg-primary/10 hover:text-primary-hover',
                            'md:justify-center xl:justify-start',
                          )}
                          title={item.label}
                          data-icod-id={`src_components_dashboard_dashboardlayout_tsx_80c4_${item.path}`}>
                          <item.icon
                            className={cn(
                              'h-5 w-5 shrink-0 transition-all duration-[300ms]',
                              active ? 'text-primary-hover' : 'text-muted-foreground group-hover:text-primary-hover',
                            )}
                          />
                          <span
                            className="md:hidden xl:inline"
                            data-icod-id={`src_components_dashboard_dashboardlayout_tsx_d848_${item.path}`}>{item.label}</span>
                          
                          {/* Active indicator — left accent bar */}
                          {active && (
                            <span
                              className="absolute left-0 h-6 w-[3px] rounded-r-full bg-primary-hover md:block xl:hidden"
                              data-icod-id={`src_components_dashboard_dashboardlayout_tsx_73ca_${item.path}`} />
                          )}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* Bottom section — user info + logout */}
        <div
          className="border-t border-border p-4 md:hidden xl:block"
          data-icod-id="src_components_dashboard_dashboardlayout_tsx_08a5">
          <div
            className="flex items-center gap-3"
            data-icod-id="src_components_dashboard_dashboardlayout_tsx_a0f6">
            {/* User avatar */}
            <div
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-foreground"
              data-icod-id="src_components_dashboard_dashboardlayout_tsx_9f72">
              <div
                className="absolute inset-0 rounded-full bg-primary p-[2px]"
                data-icod-id="src_components_dashboard_dashboardlayout_tsx_a0a5">
                <div
                  className="h-full w-full rounded-full bg-secondary flex items-center justify-center text-primary-hover"
                  data-icod-id="src_components_dashboard_dashboardlayout_tsx_f94d">
                  {userInitials}
                </div>
              </div>
            </div>
            <div
              className="min-w-0 flex-1"
              data-icod-id="src_components_dashboard_dashboardlayout_tsx_113f">
              <p
                className="truncate text-sm font-medium text-foreground"
                data-icod-id="src_components_dashboard_dashboardlayout_tsx_d947">{user?.email || 'My Account'}</p>
              <p
                className="truncate text-xs text-muted-foreground"
                data-icod-id="src_components_dashboard_dashboardlayout_tsx_94da">
                <span
                  className="capitalize"
                  data-icod-id="src_components_dashboard_dashboardlayout_tsx_0ee5">{userRole}</span>
                <span
                  className={cn(
                    'ml-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                    userRole === 'admin' && 'bg-primary/10 text-primary',
                    userRole === 'manager' && 'bg-accent/20 text-accent-foreground',
                    userRole === 'viewer' && 'bg-muted text-muted-foreground',
                  )}
                  data-icod-id="src_components_dashboard_dashboardlayout_tsx_bd89">
                  {userRole}
                </span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              className="text-muted-foreground hover:text-primary-hover hover:bg-primary/10"
              data-icod-id="src_components_dashboard_dashboardlayout_tsx_8bbb">
              <LogOut className="h-4 w-4" data-icod-id="src_components_dashboard_dashboardlayout_tsx_7ffd" />
            </Button>
          </div>
        </div>
      </aside>
      {/* Main area wrapper */}
      <div
        className="flex min-w-0 flex-1 flex-col xl:ml-[260px] md:ml-[72px]"
        data-icod-id="src_components_dashboard_dashboardlayout_tsx_6382">
        
        {/* Clean Top bar */}
        <header
          className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 shadow-[0_1px_3px_rgba(0,0,0,0.2)] sm:px-6 transition-all duration-[400ms]"
          data-icod-id="src_components_dashboard_dashboardlayout_tsx_10fc">
          <div
            className="flex items-center gap-3"
            data-icod-id="src_components_dashboard_dashboardlayout_tsx_5b16">
            {/* Hamburger for mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation"
              data-icod-id="src_components_dashboard_dashboardlayout_tsx_19d9">
              <Menu className="h-5 w-5" data-icod-id="src_components_dashboard_dashboardlayout_tsx_fd8e" />
            </Button>

            {/* Project selector dropdown — clean styling */}
            <div
              className="relative"
              ref={dropdownRef}
              data-icod-id="src_components_dashboard_dashboardlayout_tsx_9952">
              <button
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-all duration-[300ms] hover:border-primary/40 hover:shadow-[0_2px_6px_rgba(109,0,217,0.3)]"
                type="button"
                onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                aria-expanded={projectDropdownOpen}
                aria-haspopup="listbox"
                data-icod-id="src_components_dashboard_dashboardlayout_tsx_d186">
                <span
                  className="max-w-[140px] truncate sm:max-w-[200px]"
                  data-icod-id="src_components_dashboard_dashboardlayout_tsx_c4ff">{selectedProject?.name || 'Select Project'}</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform duration-[300ms]',
                    projectDropdownOpen && 'rotate-180',
                  )}
                  data-icod-id="src_components_dashboard_dashboardlayout_tsx_6b40" />
              </button>
              
              {/* Dropdown menu */}
              {projectDropdownOpen && (
                <div
                  className="absolute left-0 top-full z-50 mt-1.5 w-56 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-[0_4px_16px_rgba(0,0,0,0.4)] animate-fade-in-up"
                  role="listbox"
                  aria-label="Select project"
                  data-icod-id="src_components_dashboard_dashboardlayout_tsx_38b5">
                  {projects.length === 0 ? (
                    <div
                      className="px-3 py-4 text-center text-sm text-muted-foreground"
                      data-icod-id="src_components_dashboard_dashboardlayout_tsx_430a">
                      No projects yet
                    </div>
                  ) : (
                    projects.map((project: Project) => (
                      <button
                        key={project._id}
                        className={cn(
                          'flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-all duration-200 hover:bg-primary/10',
                          currentProjectId === project._id
                            ? 'text-primary-hover bg-primary/15'
                            : 'text-foreground',
                        )}
                        onClick={() => {
                          dispatch(setCurrentProject(project._id));
                          setProjectDropdownOpen(false);
                        }}
                        role="option"
                        aria-selected={currentProjectId === project._id}
                        data-icod-id={`src_components_dashboard_dashboardlayout_tsx_c5c8_${project._id}`}>
                        {currentProjectId === project._id && (
                          <Check
                            className="h-4 w-4 text-primary-hover"
                            data-icod-id={`src_components_dashboard_dashboardlayout_tsx_bbd2_${project._id}`} />
                        )}
                        <span
                          className={cn('truncate', currentProjectId !== project._id && 'ml-6')}
                          data-icod-id={`src_components_dashboard_dashboardlayout_tsx_e921_${project._id}`}>
                          {project.name}
                        </span>
                      </button>
                    ))
                  )}
                  {/* + New Project entry — always visible */}
                  <div
                    className="border-t border-border/50 mt-1 pt-1"
                    data-icod-id="src_components_dashboard_dashboardlayout_tsx_4f75">
                    <button
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-primary hover:bg-primary/10 transition-all duration-200"
                      onClick={() => {
                        setProjectDropdownOpen(false);
                        setCreateModalOpen(true);
                      }}
                      data-icod-id="src_components_dashboard_dashboardlayout_tsx_new_project">
                      <Plus
                        className="ml-6 h-4 w-4"
                        data-icod-id="src_components_dashboard_dashboardlayout_tsx_073f" />
                      <span data-icod-id="src_components_dashboard_dashboardlayout_tsx_07a1">New Project</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            className="flex items-center gap-2"
            data-icod-id="src_components_dashboard_dashboardlayout_tsx_d1ff">
            {/* Notification bell */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              className="relative text-muted-foreground hover:text-primary-hover"
              data-icod-id="src_components_dashboard_dashboardlayout_tsx_e1bb">
              <Bell className="h-5 w-5" data-icod-id="src_components_dashboard_dashboardlayout_tsx_5f82" />
            </Button>

            {/* User email display (tablet/mobile) */}
            <span
              className="hidden text-xs font-medium text-muted-foreground sm:block xl:hidden"
              data-icod-id="src_components_dashboard_dashboardlayout_tsx_d200">
              {user?.email || ''}
            </span>

            {/* Logout button (tablet/mobile) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label="Log out"
              className="xl:hidden text-muted-foreground hover:text-primary-hover"
              data-icod-id="src_components_dashboard_dashboardlayout_tsx_9bcc">
              <LogOut className="h-4 w-4" data-icod-id="src_components_dashboard_dashboardlayout_tsx_7c6c" />
            </Button>

            {/* User avatar (tablet/mobile only) */}
            <div
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-primary-hover xl:hidden"
              data-icod-id="src_components_dashboard_dashboardlayout_tsx_20b1">
              <div
                className="absolute inset-0 rounded-full bg-primary p-[2px]"
                data-icod-id="src_components_dashboard_dashboardlayout_tsx_da8f">
                <div
                  className="h-full w-full rounded-full bg-card flex items-center justify-center text-primary-hover"
                  data-icod-id="src_components_dashboard_dashboardlayout_tsx_29cb">
                  {userInitials}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable content area */}
        <main
          className="flex-1 overflow-y-auto p-4 sm:p-6"
          data-icod-id="src_components_dashboard_dashboardlayout_tsx_eb2c">
          <Outlet />
        </main>
      </div>
      {/* Shared Create Project Modal */}
      <CreateProjectModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        data-icod-id="src_components_dashboard_dashboardlayout_tsx_364a" />
    </div>
  );
}
