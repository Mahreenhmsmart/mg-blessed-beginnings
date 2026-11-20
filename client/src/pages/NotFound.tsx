import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import SEOHead from '@/components/SEOHead';
import { PAGE_META } from '@/seo';
import { ArrowLeft, AlertTriangle, Home, Wrench, BookOpen, Mail, Search } from 'lucide-react';

const notFoundMeta = PAGE_META['/404'];

const quickLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/services', label: 'Services', icon: Wrench },
  { to: '/blog', label: 'Blog', icon: BookOpen },
  { to: '/contact', label: 'Contact', icon: Mail },
];

export default function NotFound() {
  return (
    <>
      <SEOHead
        title={notFoundMeta.title}
        description={notFoundMeta.description}
        noindex={notFoundMeta.noindex}
        data-icod-id="src_pages_notfound_tsx_42b9" />
      <section
        className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-background py-20"
        data-icod-id="src_pages_notfound_tsx_51ca">
        
        {/* Icon */}
        <div
          className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-8"
          data-icod-id="src_pages_notfound_tsx_c215">
          <AlertTriangle
            className="h-12 w-12 text-muted-foreground"
            data-icod-id="src_pages_notfound_tsx_b966" />
        </div>

        {/* Main Message */}
        <p
          className="text-5xl font-bold text-foreground mb-4"
          aria-hidden="true"
          data-icod-id="src_pages_notfound_tsx_bc14">404</p>
        <h1
          className="text-2xl font-semibold text-foreground mb-4"
          data-icod-id="src_pages_notfound_tsx_subtitle">
          Oops! This page doesn't exist.
        </h1>
        <p
          className="text-lg text-muted-foreground mb-10 max-w-md leading-relaxed"
          data-icod-id="src_pages_notfound_tsx_b959">
          The page you're looking for may have been moved, deleted, or never existed in the first place. Let's get you back on track.
        </p>

        {/* Quick Links */}
        <div className="mb-10" data-icod-id="src_pages_notfound_tsx_links">
          <p
            className="text-sm text-muted-foreground mb-4"
            data-icod-id="src_pages_notfound_tsx_0d13">Try one of these pages:</p>
          <div className="flex flex-wrap justify-center gap-3" data-icod-id="src_pages_notfound_tsx_links_grid">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/60 bg-card hover:bg-muted/50 hover:border-primary/30 transition-all duration-200 text-sm font-medium text-foreground"
                data-icod-id={`src_pages_notfound_tsx_link_${link.label}`}>
                <link.icon className="h-4 w-4 text-primary" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Browse Tools Suggestion */}
        <div className="mb-10 p-4 rounded-xl bg-primary/5 border border-primary/10 max-w-sm" data-icod-id="src_pages_notfound_tsx_tools_suggest">
          <div
            className="flex items-center gap-2 mb-2"
            data-icod-id="src_pages_notfound_tsx_eb24">
            <Search
              className="h-4 w-4 text-primary"
              data-icod-id="src_pages_notfound_tsx_8a2a" />
            <span
              className="font-medium text-foreground text-sm"
              data-icod-id="src_pages_notfound_tsx_b66a">Looking for tools?</span>
          </div>
          <p
            className="text-xs text-muted-foreground mb-3"
            data-icod-id="src_pages_notfound_tsx_1315">
            Browse our free AI-powered e-commerce tools.
          </p>
          <Link
            to="/ai-tools"
            className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
            data-icod-id="src_pages_notfound_tsx_tools_link">
            View All Tools <ArrowLeft className="h-3 w-3 rotate-180" data-icod-id="src_pages_notfound_tsx_3d65" />
          </Link>
        </div>

        {/* Primary CTA */}
        <Link to="/" data-icod-id="src_pages_notfound_tsx_1a4d">
          <Button variant="primary" size="lg" data-icod-id="src_pages_notfound_tsx_ef31">
            <ArrowLeft className="h-4 w-4 mr-2" data-icod-id="src_pages_notfound_tsx_4ea8" />
            Back to Home
          </Button>
        </Link>
      </section>
    </>
  );
}
