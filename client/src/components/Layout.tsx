import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, ToastContainer } from '@/components/ui';
import { Menu, X, Sparkles, Zap, ArrowRight, Mail, Linkedin, Instagram, MessageCircle, Youtube, ExternalLink, ChevronDown, TrendingUp, Globe, Search, Copy, Megaphone, Briefcase, Gift, Info, BrainCircuit, Lock, LifeBuoy } from 'lucide-react';
import PWAPrompt from './PWAPrompt';
import MobileBottomNav from './MobileBottomNav';
import ChatBot from './ChatBot';
import WhatsAppButton from './WhatsAppButton';
import CookieConsent from './CookieConsent';
import BackToTop from './BackToTop';
import ConnectionBanner from './ConnectionBanner';
import { cn } from '@/utils/cn';
import { useAppSelector } from '@/store/hooks';
import { prefetchPage } from '@/utils/prefetchPage';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Wraps page content with a subtle fade-in animation.
 * 
 * NOTE: The RouteTransitionManager in App.tsx is the sole controller for
 * page visibility during transitions. This component only adds a decorative
 * entrance animation AFTER the content is already visible — it does NOT
 * manage loading states or coordinate with PageTransitionLoader.
 */
function PageContentFadeIn({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className="animate-page-fade-in"
      data-icod-id="src_components_layout_tsx_fade_wrap">
      {children}
      <style data-icod-id="src_components_layout_tsx_e7bd">{`
        @keyframes page-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-page-fade-in {
          animation: page-fade-in 0.5s ease-out both;
        }
        @keyframes more-dropdown-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-more-dropdown-in {
          animation: more-dropdown-in 0.15s ease-out both;
        }
      `}</style>
    </div>
  );
}

// Primary nav items for desktop header (visible in header bar)
const primaryNavLinks = [
  { to: '/', label: 'Home' },
  { to: '/ai-tools', label: 'AI Tools' },
  { to: '/services', label: 'Services' },
  { to: '/shop', label: 'Shop' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
];

// More dropdown sections with grouped items and icons
const moreDropdownSections = [
  {
    title: 'Growth & Intelligence',
    items: [
      { to: '/30-day-plan', label: '30-Day Plan', icon: TrendingUp },
      { to: '/website-intelligence', label: 'Website Intelligence', icon: BrainCircuit },
      { to: '/website-audit', label: 'Site Audit', icon: Search },
    ],
  },
  {
    title: 'Website & Business',
    items: [
      { to: '/website-cloner', label: 'Clone a Website', icon: Copy },
      { to: '/advertise', label: 'Advertise With Us', icon: Megaphone },
    ],
  },
  {
    title: 'Explore MG',
    items: [
      { to: '/portfolio', label: 'Portfolio', icon: Briefcase },
      { to: '/referral', label: 'Referral', icon: Gift },
      { to: '/about', label: 'About', icon: Info },
      { to: '/help', label: 'Help & FAQ', icon: LifeBuoy },
    ],
  },
];

// All More dropdown paths for active state detection
const moreDropdownPaths = moreDropdownSections.flatMap((section) => section.items.map((item) => item.to));

export default function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [mobileMoreExpanded, setMobileMoreExpanded] = useState(false);
  const moreDropdownRef = useRef<HTMLLIElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const user = useAppSelector((s) => s.auth.user);

  // Track scroll for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close "More" dropdown when clicking outside.
  // Uses 'click' (not 'mousedown') to avoid racing with the toggle button's
  // own onClick — a mousedown listener on document fires before React's
  // synthetic click on the button, causing the dropdown to open then
  // immediately close in the same interaction frame.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close "More" dropdown on route change
  useEffect(() => {
    setIsMoreOpen(false);
    setMobileMoreExpanded(false);
  }, [location.pathname]);

  // Close mobile menu on Escape key
  const handleEscapeKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsMoreOpen(false);
      setIsMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [handleEscapeKey]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Check if any More dropdown link is active (for "More" button styling)
  const isMoreActive = moreDropdownPaths.some((path) => isActive(path));

  return (
    <div
      className="min-h-screen flex flex-col bg-background overflow-x-hidden"
      data-icod-id="src_components_layout_tsx_705d">
      {/* Global connection status banner */}
      <ConnectionBanner data-icod-id="src_components_layout_tsx_f453" />
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium"
        data-icod-id="src_components_layout_tsx_skip_link">
        Skip to main content
      </a>
      {/* Premium Header — Dark navy SaaS-style 3-zone flex layout */}
      <header
        className={cn(
          'sticky top-0 z-[100] border-b transition-all duration-300 ease-out',
          scrolled
            ? 'bg-background/95 backdrop-blur-xl border-border/50 shadow-lg'
            : 'bg-background border-transparent'
        )}
        data-icod-id="src_components_layout_tsx_c825">
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          data-icod-id="src_components_layout_tsx_67ee">
          <div
            className="flex items-center justify-between h-16 md:h-[4.5rem] gap-4 flex-nowrap"
            data-icod-id="src_components_layout_tsx_1c4a">
            
            {/* LEFT ZONE: Logo + Brand (compact, flex-shrink-0) */}
            <Link
              to="/"
              className="group flex items-center gap-2 font-bold text-foreground font-heading transition-opacity hover:opacity-90 flex-shrink-0 min-w-0"
              aria-label="MG Blessed Beginnings - Home"
              data-icod-id="src_components_layout_tsx_0e2f">
              <img
                src="https://drive.google.com/thumbnail?id=17_eHHL7Lgz4XxCm2NlcyhqW4PLEFUTxr&sz=w1920"
                alt="MG Blessed Beginnings"
                className="h-10 md:h-12 w-auto flex-shrink-0 transition-transform duration-300 group-hover:scale-105 object-contain mr-1"
                data-icod-id="src_components_layout_tsx_logo_img" />
              <div className="flex flex-col leading-none gap-0 flex-shrink-0 hidden sm:flex min-w-0" data-icod-id="src_components_layout_tsx_brand_text">
                <span className="text-base md:text-lg font-extrabold tracking-tight whitespace-nowrap text-foreground truncate" data-icod-id="src_components_layout_tsx_5a0c_mg">
                  MG
                </span>
                <span className="text-[9px] md:text-[10px] font-semibold tracking-wide whitespace-nowrap text-foreground/70 truncate" data-icod-id="src_components_layout_tsx_5a0c_bb">
                  Blessed Beginnings
                </span>
              </div>
            </Link>

            {/* CENTER ZONE: Desktop Navigation (horizontally centered) */}
            <nav
              className="hidden lg:flex items-center justify-center flex-1 min-w-0"
              aria-label="Main navigation"
              data-icod-id="src_components_layout_tsx_873c">
              <ul
                className="flex items-center gap-1 xl:gap-2"
                role="menubar"
                data-icod-id="src_components_layout_tsx_d164">
                {/* Primary nav items */}
                {primaryNavLinks.map((link) => (
                  <li
                    key={link.to}
                    role="none"
                    data-icod-id={`src_components_layout_tsx_3e56_${link.to}`}>
                    <Link
                      to={link.to}
                      role="menuitem"
                      aria-current={isActive(link.to) ? 'page' : undefined}
                      onMouseEnter={() => prefetchPage(link.to)}
                      onFocus={() => prefetchPage(link.to)}
                      className={cn(
                        'group relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap',
                        isActive(link.to)
                          ? 'text-primary'
                          : 'text-foreground hover:text-accent'
                      )}
                      data-icod-id={`src_components_layout_tsx_b27b_${link.to}`}>
                      {link.label}
                      {/* Active underline indicator */}
                      {isActive(link.to) && (
                        <span
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4/5 rounded-full bg-primary"
                          aria-hidden="true"
                          data-icod-id={`src_components_layout_tsx_active_dot_${link.to}`} />
                      )}
                    </Link>
                  </li>
                ))}

                {/* More dropdown with mega-menu */}
                <li 
                  className="relative" 
                  ref={moreDropdownRef} 
                  role="none" 
                  data-icod-id="src_components_layout_tsx_more_dropdown">
                  <button
                    onClick={() => setIsMoreOpen((prev) => !prev)}
                    className={cn(
                      'flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap',
                      isMoreActive || isMoreOpen
                        ? 'text-primary'
                        : 'text-foreground hover:text-accent'
                    )}
                    aria-expanded={isMoreOpen}
                    aria-haspopup="true"
                    aria-label="More navigation options"
                    data-icod-id="src_components_layout_tsx_more_btn">
                    More
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 transition-transform duration-200',
                        isMoreOpen && 'rotate-180'
                      )}
                      aria-hidden="true"
                      data-icod-id="src_components_layout_tsx_more_chevron" />
                  </button>

                  {/* Premium Mega-Menu Dropdown — conditionally rendered to prevent
                      phantom event interception in production builds */}
                  {isMoreOpen && (
                    <div
                      className="absolute top-full right-0 mt-2 w-[320px] p-4 bg-background border border-border/60 rounded-xl shadow-2xl z-[150] animate-more-dropdown-in"
                      role="menu"
                      data-icod-id="src_components_layout_tsx_more_menu">
                      {moreDropdownSections.map((section) => (
                        <div
                          key={section.title}
                          className="mb-4 last:mb-0"
                          data-icod-id={`src_components_layout_tsx_4c77_${section.title}`}>
                          <h4 
                            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2"
                            data-icod-id={`src_components_layout_tsx_more_section_${section.title}`}>
                            {section.title}
                          </h4>
                          <div
                            className="space-y-0.5"
                            data-icod-id={`src_components_layout_tsx_5241_${section.title}`}>
                            {section.items.map((item) => {
                              const Icon = item.icon;
                              return (
                                <Link
                                  key={item.to}
                                  to={item.to}
                                  role="menuitem"
                                  onClick={() => setIsMoreOpen(false)}
                                  onMouseEnter={() => prefetchPage(item.to)}
                                  onFocus={() => prefetchPage(item.to)}
                                  className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                                    isActive(item.to)
                                      ? 'text-primary bg-primary/10'
                                      : 'text-foreground/90 hover:text-accent hover:bg-white/5'
                                  )}
                                  data-icod-id={`src_components_layout_tsx_more_link_${item.to}`}>
                                  <Icon
                                    className={cn(
                                      'h-4 w-4 flex-shrink-0',
                                      isActive(item.to) ? 'text-primary' : 'text-muted-foreground'
                                    )}
                                    aria-hidden="true"
                                    data-icod-id={`src_components_layout_tsx_f9de_${section.title}_${item.to}`} />
                                  <span
                                    data-icod-id={`src_components_layout_tsx_e63f_${section.title}_${item.to}`}>{item.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              </ul>
            </nav>

            {/* RIGHT ZONE: CTA Button + Mobile Menu Toggle */}
            <div
              className="flex items-center gap-3 flex-shrink-0"
              data-icod-id="src_components_layout_tsx_bcc7">
              
              {/* Desktop CTA Button — Purple-to-teal gradient pill */}
              <Link
                to="/book-consultation"
                className="hidden md:inline-flex"
                data-icod-id="src_components_layout_tsx_142a">
                <button
                  className={cn(
                    'inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold text-primary-foreground whitespace-nowrap',
                    'transition-all duration-300 ease-out',
                    'shadow-[0_4px_15px_rgba(157,106,255,0.4)]',
                    'hover:shadow-[0_6px_25px_rgba(157,106,255,0.6)] hover:scale-105',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background'
                  )}
                  style={{ background: 'linear-gradient(135deg, #9D6AFF 0%, #00D4F5 100%)' }}
                  data-icod-id="src_components_layout_tsx_cta_btn">
                  Book Consultation
                </button>
              </Link>

              {/* Mobile hamburger menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={cn(
                  'lg:hidden p-2 rounded-lg transition-all duration-200',
                  'text-foreground hover:bg-white/10',
                  'focus:outline-none focus:ring-2 focus:ring-primary'
                )}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-nav-panel"
                data-icod-id="src_components_layout_tsx_1311">
                {isMenuOpen ? <X className="h-6 w-6" data-icod-id="src_components_layout_tsx_d179" /> : <Menu className="h-6 w-6" data-icod-id="src_components_layout_tsx_f551" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Overlay — Full-screen with backdrop blur */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="lg:hidden fixed inset-0 top-16 bg-black/70 backdrop-blur-sm z-[99]"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
              data-icod-id="src_components_layout_tsx_mobile_backdrop" />
            
            {/* Mobile nav panel */}
            <nav
              id="mobile-nav-panel"
              ref={mobileMenuRef}
              className="lg:hidden fixed top-16 left-0 right-0 bottom-0 bg-background z-[100] overflow-y-auto animate-slide-in-right"
              aria-label="Mobile navigation"
              data-icod-id="src_components_layout_tsx_abc3">
              <div className="p-4 space-y-1" data-icod-id="src_components_layout_tsx_09de">
                {/* Primary navigation links */}
                {primaryNavLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    onMouseEnter={() => prefetchPage(link.to)}
                    onFocus={() => prefetchPage(link.to)}
                    aria-current={isActive(link.to) ? 'page' : undefined}
                    className={cn(
                      'block px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200',
                      isActive(link.to)
                        ? 'text-primary bg-primary/10'
                        : 'text-foreground/90 hover:text-foreground hover:bg-white/5'
                    )}
                    data-icod-id={`src_components_layout_tsx_da1a_${link.to}`}>
                    {link.label}
                  </Link>
                ))}
                
                {/* More expandable section */}
                <div className="mt-2" data-icod-id="src_components_layout_tsx_9381">
                  <button
                    onClick={() => setMobileMoreExpanded(!mobileMoreExpanded)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200',
                      mobileMoreExpanded || moreDropdownPaths.some(p => isActive(p))
                        ? 'text-primary bg-primary/10'
                        : 'text-foreground/90 hover:text-foreground hover:bg-white/5'
                    )}
                    aria-expanded={mobileMoreExpanded}
                    data-icod-id="src_components_layout_tsx_mobile_more_btn">
                    <span data-icod-id="src_components_layout_tsx_3056">More</span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        mobileMoreExpanded && 'rotate-180'
                      )}
                      aria-hidden="true"
                      data-icod-id="src_components_layout_tsx_02f7" />
                  </button>
                  
                  {/* Expandable More submenu */}
                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-300 ease-out',
                      mobileMoreExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    )}
                    data-icod-id="src_components_layout_tsx_mobile_more_submenu">
                    <div
                      className="pl-4 pr-2 py-2 space-y-4"
                      data-icod-id="src_components_layout_tsx_7287">
                      {moreDropdownSections.map((section) => (
                        <div
                          key={section.title}
                          data-icod-id={`src_components_layout_tsx_f4e3_${section.title}`}>
                          <h4 
                            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3"
                            data-icod-id={`src_components_layout_tsx_mobile_more_section_${section.title}`}>
                            {section.title}
                          </h4>
                          <div
                            className="space-y-0.5"
                            data-icod-id={`src_components_layout_tsx_4c48_${section.title}`}>
                            {section.items.map((item) => {
                              const Icon = item.icon;
                              return (
                                <Link
                                  key={item.to}
                                  to={item.to}
                                  onClick={() => setIsMenuOpen(false)}
                                  onMouseEnter={() => prefetchPage(item.to)}
                                  onFocus={() => prefetchPage(item.to)}
                                  aria-current={isActive(item.to) ? 'page' : undefined}
                                  className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                                    isActive(item.to)
                                      ? 'text-primary bg-primary/10'
                                      : 'text-foreground/80 hover:text-foreground hover:bg-white/5'
                                  )}
                                  data-icod-id={`src_components_layout_tsx_mobile_more_link_${item.to}`}>
                                  <Icon
                                    className={cn(
                                      'h-4 w-4 flex-shrink-0',
                                      isActive(item.to) ? 'text-primary' : 'text-muted-foreground'
                                    )}
                                    aria-hidden="true"
                                    data-icod-id={`src_components_layout_tsx_6b61_${section.title}_${item.to}`} />
                                  <span
                                    data-icod-id={`src_components_layout_tsx_b016_${section.title}_${item.to}`}>{item.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Divider */}
                <div
                  className="h-px bg-border/50 my-4"
                  aria-hidden="true"
                  data-icod-id="src_components_layout_tsx_cc66" />
                
                {/* Mobile CTA Button */}
                <Link
                  to="/book-consultation"
                  onClick={() => setIsMenuOpen(false)}
                  className="block"
                  data-icod-id="src_components_layout_tsx_aff8">
                  <button
                    className={cn(
                      'w-full inline-flex items-center justify-center gap-2 px-5 py-4 rounded-xl text-base font-bold text-primary-foreground',
                      'shadow-[0_4px_15px_rgba(157,106,255,0.4)]'
                    )}
                    style={{ background: 'linear-gradient(135deg, #9D6AFF 0%, #00D4F5 100%)' }}
                    data-icod-id="src_components_layout_tsx_8fd1">
                    <Sparkles className="h-5 w-5" aria-hidden="true" data-icod-id="src_components_layout_tsx_e251" />
                    Book Consultation
                    <ArrowRight
                      className="h-4 w-4"
                      aria-hidden="true"
                      data-icod-id="src_components_layout_tsx_3aaf" />
                  </button>
                </Link>
              </div>
            </nav>
          </>
        )}
      </header>
      {/* Main Content — full-width so homepage sections can have edge-to-edge backgrounds */}
      <main
        id="main-content"
        className="flex-1 w-full pb-20 md:pb-0 overflow-x-hidden min-h-[calc(100vh-5rem)]"
        data-icod-id="src_components_layout_tsx_8242">
        <PageContentFadeIn data-icod-id="src_components_layout_tsx_fade_in">
          {children}
        </PageContentFadeIn>
      </main>
      {/* Premium Footer — Light lavender background with brand colors */}
      <footer
        className="relative border-t border-border overflow-hidden"
        style={{ backgroundColor: '#161A28' }}
        data-icod-id="src_components_layout_tsx_ea56">
        
        {/* Subtle decorative accent line at top */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: 'linear-gradient(90deg, #9D6AFF 0%, #00D4F5 50%, #FF6EB4 100%)' }}
          data-icod-id="src_components_layout_tsx_footer_accent_line" />
        
        <div
          className="relative max-w-7xl mx-auto px-4 pt-16 pb-10"
          data-icod-id="src_components_layout_tsx_77ea">
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8"
            data-icod-id="src_components_layout_tsx_eaa9">
            
            {/* Column 1 — Brand */}
            <div className="lg:col-span-4" data-icod-id="src_components_layout_tsx_d12a">
              <Link
                to="/"
                className="flex items-center gap-2.5 font-bold text-lg mb-5 font-heading group"
                data-icod-id="src_components_layout_tsx_2e74">
                <img
                  src="https://drive.google.com/thumbnail?id=17_eHHL7Lgz4XxCm2NlcyhqW4PLEFUTxr&sz=w1920"
                  alt="MG Blessed Beginnings"
                  className="h-12 md:h-14 w-auto flex-shrink-0 transition-transform duration-[400ms] group-hover:scale-105 object-contain mr-1"
                  data-icod-id="src_components_layout_tsx_footer_logo_img" />
                <div className="flex flex-col leading-none" data-icod-id="src_components_layout_tsx_footer_brand_text">
                  <span className="text-xl font-extrabold tracking-tight whitespace-nowrap text-primary" data-icod-id="src_components_layout_tsx_8e6f_mg">
                    MG
                  </span>
                  <span className="text-[11px] font-semibold tracking-wide whitespace-nowrap text-muted-foreground" data-icod-id="src_components_layout_tsx_8e6f_bb">
                    Blessed Beginnings
                  </span>
                </div>
              </Link>
              <p
                className="text-sm font-body leading-relaxed mb-6 max-w-xs text-muted-foreground"
                data-icod-id="src_components_layout_tsx_8c9f">
                Empowering e-commerce entrepreneurs with AI tools, expert guidance, and proven strategies for digital growth.
              </p>
              
              {/* Contact email */}
              <div
                className="flex items-center gap-2 text-sm mb-2 text-muted-foreground"
                data-icod-id="src_components_layout_tsx_861d">
                <Mail
                  className="h-4 w-4 text-primary"
                  data-icod-id="src_components_layout_tsx_414b" />
                <a
                  href="mailto:hmsmart.official@gmail.com"
                  className="transition-colors duration-200 hover:underline text-foreground hover:text-primary"
                  data-icod-id="src_components_layout_tsx_5e72">hmsmart.official@gmail.com</a>
              </div>

              {/* WhatsApp Link */}
              <a
                href="https://wa.me/923358380233"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm transition-colors duration-200 mt-1 text-muted-foreground hover:text-accent"
                data-icod-id="src_components_layout_tsx_footer_wa">
                <MessageCircle
                  className="h-4 w-4 text-accent"
                  data-icod-id="src_components_layout_tsx_footer_wa_icon" />
                <span data-icod-id="src_components_layout_tsx_1f2f">Chat on WhatsApp</span>
              </a>

              {/* Social Media Links */}
              <div
                className="flex items-center gap-2.5 mt-5"
                data-icod-id="src_components_layout_tsx_9b34">
                <a
                  href="https://www.linkedin.com/in/mahreenyousafdigital/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                  data-icod-id="src_components_layout_tsx_6936">
                  <Linkedin className="h-4 w-4" data-icod-id="src_components_layout_tsx_3358" />
                </a>
                <a
                  href="https://www.instagram.com/mahreenyousafdigi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram (Personal)"
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                  data-icod-id="src_components_layout_tsx_ig_personal">
                  <Instagram className="h-4 w-4" data-icod-id="src_components_layout_tsx_ig_personal_icon" />
                </a>
                <a
                  href="https://www.instagram.com/mgblessedbeginnings/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram (Brand)"
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                  data-icod-id="src_components_layout_tsx_1955">
                  <Instagram className="h-4 w-4" data-icod-id="src_components_layout_tsx_3d1e" />
                </a>
                <a
                  href="https://www.tiktok.com/@hmsmart.ceo"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                  data-icod-id="src_components_layout_tsx_a430">
                  <Zap className="h-4 w-4" data-icod-id="src_components_layout_tsx_eda1" />
                </a>
                <a
                  href="https://www.youtube.com/@blessedbeginnings8003"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                  data-icod-id="src_components_layout_tsx_youtube">
                  <Youtube className="h-4 w-4" data-icod-id="src_components_layout_tsx_youtube_icon" />
                </a>
                <a
                  href="https://www.pinterest.com/mgblessedbeginnings/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Pinterest"
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                  data-icod-id="src_components_layout_tsx_pinterest">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                    aria-hidden="true"
                    data-icod-id="src_components_layout_tsx_5de8"><path
                    d="M12 0C5.373 0 0 5.373 0 12c0 4.99 3.063 9.248 7.406 11.078-.102-.937-.195-2.375.042-3.397l1.453-6.17s-.37-.742-.37-1.837c0-1.718.992-2.998 2.228-2.998 1.048 0 1.553.787 1.553 1.73 0 1.056-.672 2.636-1.018 4.099-.29 1.226.613 2.226 1.822 2.226 2.186 0 3.868-2.305 3.868-5.63 0-2.945-2.116-4.998-5.136-4.998-3.744 0-5.94 2.81-5.94 5.715 0 1.132.436 2.345.982 3.004.108.13.124.25.093.383l-.368 1.493c-.058.235-.188.286-.434.173-1.62-.754-2.627-3.118-2.627-5.018 0-4.086 2.968-7.838 8.563-7.838 4.496 0 7.99 3.204 7.99 7.488 0 4.47-2.818 8.07-6.73 8.07-1.314 0-2.548-.683-2.973-1.488l-.81 3.08c-.293 1.122-1.085 2.525-1.617 3.38A12.002 12.002 0 0 0 24 12c0-6.627-5.373-12-12-12z"
                    data-icod-id="src_components_layout_tsx_c8e0" /></svg>
                </a>
                <a
                  href="https://www.figma.com/make/Xg8GjmaWh0jQAsQg3Uoabo/mahreen-yousaf--Community-?p=f&fullscreen=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Figma Portfolio"
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                  data-icod-id="src_components_layout_tsx_figma">
                  <ExternalLink className="h-4 w-4" data-icod-id="src_components_layout_tsx_figma_icon" />
                </a>
                <a
                  href="https://www.behance.net/gallery/241251221/Portfolio"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Behance Portfolio"
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                  data-icod-id="src_components_layout_tsx_behance">
                  <ExternalLink className="h-4 w-4" data-icod-id="src_components_layout_tsx_behance_icon" />
                </a>
              </div>
            </div>

            {/* Column 2 — Explore */}
            <div className="lg:col-span-2" data-icod-id="src_components_layout_tsx_3007">
              <h3
                className="font-bold mb-5 font-heading text-sm uppercase tracking-widest text-primary"
                data-icod-id="src_components_layout_tsx_ce05">Explore</h3>
              {/* Decorative accent line under heading */}
              <div className="w-8 h-0.5 rounded-full mb-5" style={{ background: 'linear-gradient(90deg, #9D6AFF, #00D4F5)' }} data-icod-id="src_components_layout_tsx_explore_accent" />
              <ul className="space-y-3" data-icod-id="src_components_layout_tsx_6788">
                {[
                  { label: 'Home', to: '/' },
                  { label: 'AI Tools', to: '/ai-tools' },
                  { label: 'Services', to: '/services' },
                  { label: 'Blog', to: '/blog' },
                  { label: 'Portfolio', to: '/portfolio' },
                  { label: 'About', to: '/about' },
                ].map((item) => (
                  <li
                    key={item.label}
                    data-icod-id={`src_components_layout_tsx_5d04_${item.label}`}>
                    <Link
                      to={item.to}
                      className="group flex items-center gap-1.5 text-[15px] font-medium transition-colors duration-200 text-muted-foreground hover:text-primary"
                      data-icod-id={`src_components_layout_tsx_link_${item.label}`}>
                      <span
                        className="w-0 group-hover:w-1.5 h-[2px] rounded-full transition-all duration-200 bg-primary"
                        data-icod-id={`src_components_layout_tsx_5d95_${item.label}`} />
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li data-icod-id="src_components_layout_tsx_5d04_fashion_blog">
                  <Link
                    to="/blog"
                    className="group flex items-center gap-1.5 text-[15px] font-medium transition-colors duration-200 text-muted-foreground hover:text-primary"
                    data-icod-id="src_components_layout_tsx_link_fashion_blog">
                    <span
                      className="w-0 group-hover:w-1.5 h-[2px] rounded-full transition-all duration-200 bg-primary"
                      data-icod-id="src_components_layout_tsx_5d95_fashion_blog" />
                    Fashion Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 — Solutions */}
            <div className="lg:col-span-2" data-icod-id="src_components_layout_tsx_e60e">
              <h3
                className="font-bold mb-5 font-heading text-sm uppercase tracking-widest text-primary"
                data-icod-id="src_components_layout_tsx_0365">Solutions</h3>
              {/* Decorative accent line under heading */}
              <div className="w-8 h-0.5 rounded-full mb-5" style={{ background: 'linear-gradient(90deg, #9D6AFF, #00D4F5)' }} data-icod-id="src_components_layout_tsx_solutions_accent" />
              <ul className="space-y-3" data-icod-id="src_components_layout_tsx_b463">
                {[
                  { label: 'Website Intelligence', to: '/website-intelligence' },
                  { label: '30-Day Growth Plan', to: '/30-day-plan' },
                  { label: 'Site Audit', to: '/website-audit' },
                  { label: 'Clone a Website', to: '/website-cloner' },
                  { label: 'Advertise With Us', to: '/advertise' },
                ].map((item) => (
                  <li
                    key={item.label}
                    data-icod-id={`src_components_layout_tsx_fe92_${item.label}`}>
                    <Link
                      to={item.to}
                      className="group flex items-center gap-1.5 text-[15px] font-medium transition-colors duration-200 text-muted-foreground hover:text-primary"
                      data-icod-id={`src_components_layout_tsx_link_${item.label}`}>
                      <span
                        className="w-0 group-hover:w-1.5 h-[2px] rounded-full transition-all duration-200 bg-primary"
                        data-icod-id={`src_components_layout_tsx_79d4_${item.label}`} />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 — Get Started */}
            <div className="lg:col-span-4" data-icod-id="src_components_layout_tsx_e3f4">
              <h3
                className="font-bold mb-5 font-heading text-sm uppercase tracking-widest text-primary"
                data-icod-id="src_components_layout_tsx_35c5">
                Get Started</h3>
              {/* Decorative accent line under heading */}
              <div className="w-8 h-0.5 rounded-full mb-5" style={{ background: 'linear-gradient(90deg, #9D6AFF, #00D4F5)' }} data-icod-id="src_components_layout_tsx_getstarted_accent" />
              <ul className="space-y-3 mb-6" data-icod-id="src_components_layout_tsx_e191">
                {[
                  { label: 'Book Free Consultation', to: '/book-consultation' },
                  { label: 'Referral / Earn Rewards', to: '/referral' },
                  { label: 'Contact', to: '/contact' },
                  { label: 'Help & Troubleshooting', to: '/help' },
                  ...(user ? [{ label: 'My Ad Dashboard', to: '/ad-dashboard' }] : []),
                ].map((item) => (
                  <li
                    key={item.label}
                    data-icod-id={`src_components_layout_tsx_7d59_${item.label}`}>
                    <Link
                      to={item.to}
                      className="group flex items-center gap-1.5 text-[15px] font-medium transition-colors duration-200 text-muted-foreground hover:text-primary"
                      data-icod-id={`src_components_layout_tsx_link_${item.label}`}>
                      <span
                        className="w-0 group-hover:w-1.5 h-[2px] rounded-full transition-all duration-200 bg-primary"
                        data-icod-id={`src_components_layout_tsx_de1a_${item.label}`} />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              
              {/* CTA Button — Purple-to-teal gradient pill matching header */}
              <Link to="/book-consultation" data-icod-id="src_components_layout_tsx_2a75">
                <button
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-primary-foreground transition-all duration-300 ease-out shadow-[0_4px_15px_rgba(157,106,255,0.3)] hover:shadow-[0_6px_25px_rgba(157,106,255,0.5)] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  style={{ background: 'linear-gradient(135deg, #9D6AFF 0%, #00D4F5 100%)' }}
                  data-icod-id="src_components_layout_tsx_3d81">
                  Book Consultation
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    data-icod-id="src_components_layout_tsx_18f0" />
                </button>
              </Link>
            </div>
          </div>

          {/* Copyright Section — Soft lavender divider */}
          <div
            className="mt-14 pt-8 border-t border-border flex flex-col md:flex-row flex-wrap justify-between items-center gap-4 text-sm font-medium text-muted-foreground"
            data-icod-id="src_components_layout_tsx_258e">
            <p data-icod-id="src_components_layout_tsx_47e5">&copy; {new Date().getFullYear()} MG Blessed Beginnings. All rights reserved.</p>
            
            {/* Legal Links */}
            <div className="flex flex-wrap justify-center items-center gap-6" data-icod-id="src_components_layout_tsx_legal_links">
              <Link
                to="/privacy-policy"
                className="transition-colors duration-200 text-muted-foreground hover:text-primary"
                data-icod-id="src_components_layout_tsx_f6c2">Privacy Policy</Link>
              <Link
                to="/terms-of-service"
                className="transition-colors duration-200 text-muted-foreground hover:text-primary"
                data-icod-id="src_components_layout_tsx_84ac">Terms of Service</Link>
              <Link
                to="/cookie-policy"
                className="transition-colors duration-200 text-muted-foreground hover:text-primary"
                data-icod-id="src_components_layout_tsx_3a89">Cookie Policy</Link>
              <Link
                to="/dashboard"
                aria-label="Admin Dashboard"
                className="transition-colors duration-200 text-muted-foreground hover:text-primary"
                data-icod-id="src_components_layout_tsx_admin_link">
                <Lock className="h-3.5 w-3.5" data-icod-id="src_components_layout_tsx_admin_icon" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav data-icod-id="src_components_layout_tsx_a2d6" />
      {/* Toast Notifications */}
      <ToastContainer data-icod-id="src_components_layout_tsx_13fc" />
      <PWAPrompt data-icod-id="src_components_layout_tsx_73c6" />
      {/* Floating AI Chatbot Widget */}
      <ChatBot data-icod-id="src_components_layout_tsx_ef09" />
      {/* Back to Top Button */}
      <BackToTop data-icod-id="src_components_layout_tsx_backtotop" />
      {/* Floating WhatsApp Button */}
      <WhatsAppButton data-icod-id="src_components_layout_tsx_bdac" />
      {/* Cookie Consent Banner */}
      <CookieConsent data-icod-id="src_components_layout_tsx_cookieconsent" />
    </div>
  );
}
