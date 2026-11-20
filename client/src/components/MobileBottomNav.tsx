import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, Wrench, FileText, Phone } from 'lucide-react';
import { cn } from '@/utils/cn';
import { prefetchPage } from '@/utils/prefetchPage';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/ai-tools', label: 'AI Tools', icon: Sparkles },
  { to: '/services', label: 'Services', icon: Wrench },
  { to: '/blog', label: 'Blog', icon: FileText },
  { to: '/contact', label: 'Contact', icon: Phone },
];

/**
 * Fixed bottom navigation bar for mobile devices.
 * Visible only on screens smaller than lg breakpoint.
 */
export default function MobileBottomNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[95] bg-[#0B0F1A]/95 backdrop-blur-md border-t border-border/50 shadow-[0_-2px_10px_rgba(0,0,0,0.4)]"
      aria-label="Mobile bottom navigation"
      data-icod-id="src_components_mobilebottomnav_tsx_03b3">
      <div
        className="flex items-center justify-around py-2 px-2 safe-area-pb"
        data-icod-id="src_components_mobilebottomnav_tsx_8c35">
        {navItems.map((item) => {
          const active = isActive(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              onMouseEnter={() => prefetchPage(item.to)}
              onFocus={() => prefetchPage(item.to)}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[44px] min-h-[44px]',
                active ? 'text-primary' : 'text-foreground/70 hover:text-foreground',
              )}
              data-icod-id={`src_components_mobilebottomnav_tsx_95c6_${item.to}`}>
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200',
                  active && 'text-white shadow-sm',
                )}
                style={active ? { background: 'linear-gradient(135deg, #7662C7 0%, #29ADA4 100%)' } : undefined}
                data-icod-id={`src_components_mobilebottomnav_tsx_230c_${item.to}`}>
                <Icon
                  className="h-5 w-5"
                  data-icod-id={`src_components_mobilebottomnav_tsx_403b_${item.to}`} />
              </div>
              <span
                className="text-xs font-medium"
                data-icod-id={`src_components_mobilebottomnav_tsx_cc5e_${item.to}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
