import { useState, useEffect } from 'react';
import { Globe, Download, ExternalLink, AlertCircle, Copy, Check, Clock, HardDrive, Hash, Info, Shield, FileCode, Image as ImageIcon, XCircle, Link2, AlertTriangle } from 'lucide-react';
import { Button, Input, Card, Spinner, Alert } from '@/components/ui';
import { cn } from '@/utils/cn';
import SEOHead from '@/components/SEOHead';
import { cloneWebsite, getRecentClones, getPreviewUrl, getDownloadUrl, type CloneResponse, type RecentCloneItem } from '@/services/clonerService';
import { SchemaInjector, PAGE_META } from '@/seo';
import apiClient from '@/services/apiClient';
import { getWebsiteClonerContent } from '@/services/pageContentService';

const websiteClonerMeta = PAGE_META['/website-cloner'];

/** Format bytes into human-readable size */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

/** Format date to readable string */
function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default function WebsiteCloner() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CloneResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentClones, setRecentClones] = useState<RecentCloneItem[]>([]);
  const [clonesLoading, setClonesLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<{ id: string; message: string; type: 'success' | 'error' } | null>(null);
  const pageContent = getWebsiteClonerContent();

  // Load recent clones on mount
  useEffect(() => {
    let cancelled = false;
    async function loadClones() {
      try {
        const clones = await getRecentClones();
        if (!cancelled) setRecentClones(clones);
      } catch {
        // Silently fail — the list is optional
      } finally {
        if (!cancelled) setClonesLoading(false);
      }
    }
    loadClones();
    return () => { cancelled = true; };
  }, []);

  const handleClone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a URL.');
      return;
    }

    setLoading(true);
    try {
      const data = await cloneWebsite(trimmed);
      setResult(data);
      // Refresh the recent clones list
      const clones = await getRecentClones();
      setRecentClones(clones);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clone website. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <>
      <SEOHead
        title={websiteClonerMeta.title}
        description={websiteClonerMeta.description}
        keywords={websiteClonerMeta.keywords}
        canonicalUrl={websiteClonerMeta.canonical}
        data-icod-id="src_pages_websitecloner_tsx_b26e" />
      <SchemaInjector
        schemaType="page"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Website Cloner', url: '/website-cloner' },
        ]}
        data-icod-id="src_pages_websitecloner_tsx_887f" />
      <div
        className="min-h-screen pb-16"
        data-icod-id="src_pages_websitecloner_tsx_f27a">
        {/* Hero Header */}
        <section
          className="relative overflow-hidden py-16 md:py-24"
          style={{ background: 'var(--gradient-hero)' }}
          data-icod-id="src_pages_websitecloner_tsx_967a">
          {/* Ambient glow effects */}
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-[120px] pointer-events-none"
            style={{ background: 'rgb(var(--primary))' }}
            data-icod-id="src_pages_websitecloner_tsx_2fb4" />
          <div
            className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-15 blur-[100px] pointer-events-none"
            style={{ background: 'rgb(var(--accent))' }}
            data-icod-id="src_pages_websitecloner_tsx_91b8" />

          <div
            className="relative max-w-7xl mx-auto px-4 text-center"
            data-icod-id="src_pages_websitecloner_tsx_f206">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 text-sm font-semibold tracking-wide uppercase"
              style={{
                borderColor: 'rgb(var(--primary) / 0.3)',
                background: 'rgb(var(--primary) / 0.1)',
                color: 'rgb(var(--primary-hover))',
              }}
              data-icod-id="src_pages_websitecloner_tsx_f2c4">
              <Globe className="h-4 w-4" data-icod-id="src_pages_websitecloner_tsx_6ea0" />
              Free Tool
            </div>
            <h1
              className="font-heading font-extrabold tracking-tight mb-4"
              style={{
                fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
                lineHeight: 1.1,
                color: 'rgb(var(--foreground))',
              }}
              data-icod-id="src_pages_websitecloner_tsx_7ccf">
              Website Cloner
            </h1>
            <p
              className="text-lg md:text-xl max-w-xl mx-auto leading-relaxed mb-4"
              style={{ color: 'rgb(var(--muted-foreground))' }}
              data-icod-id="src_pages_websitecloner_tsx_427d">
              Create a single-file visual clone of any public website.
            </p>
            <p
              className="text-sm max-w-lg mx-auto"
              style={{ color: 'rgb(var(--muted-foreground) / 0.8)' }}
              data-icod-id="src_pages_websitecloner_tsx_desc2">
              Styles are inlined, small images embedded as base64, and all scripts removed for security. The result is a self-contained HTML file you can open anywhere.
            </p>
          </div>
        </section>

        {/* AEO Direct Answer Section */}
        <section className="max-w-7xl mx-auto px-4 py-8 mb-2" data-icod-id="src_pages_websitecloner_tsx_aeo_section">
          <h2 className="text-xl font-bold text-foreground mb-3" data-icod-id="src_pages_websitecloner_tsx_aeo_h2">What is a website cloner?</h2>
          <p className="text-muted-foreground leading-relaxed" data-icod-id="src_pages_websitecloner_tsx_aeo_p">
            A website cloner creates a single-file visual copy of any public webpage by fetching its HTML, inlining all CSS stylesheets, embedding small images as base64 data URIs, and stripping JavaScript for security. The result is a self-contained HTML file you can open locally for research, design inspiration, backup, or migration planning without needing an internet connection.
          </p>
        </section>

        {/* Main Content */}
        <div
          className="max-w-7xl mx-auto px-4 -mt-8 relative z-10"
          data-icod-id="src_pages_websitecloner_tsx_fb08">
          {/* Clone Form Card */}
          <Card
            className="p-6 md:p-8 mb-8"
            data-icod-id="src_pages_websitecloner_tsx_d155">
            <form
              onSubmit={handleClone}
              className="space-y-4"
              data-icod-id="src_pages_websitecloner_tsx_6e10">
              <label
                htmlFor="clone-url"
                className="block text-sm font-semibold tracking-wide"
                style={{ color: 'rgb(var(--muted-foreground))' }}
                data-icod-id="src_pages_websitecloner_tsx_a26d">
                Website URL
              </label>
              <div
                className="flex flex-col sm:flex-row gap-3"
                data-icod-id="src_pages_websitecloner_tsx_6c34">
                <Input
                  id="clone-url"
                  type="url"
                  placeholder="https://your-website.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  className="flex-1"
                  required
                  data-icod-id="src_pages_websitecloner_tsx_cb0e" />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="whitespace-nowrap shadow-[0_6px_20px_rgba(157,106,255,0.4)]"
                  data-icod-id="src_pages_websitecloner_tsx_c774">
                  {loading ? 'Cloning...' : 'Clone Website'}
                </Button>
              </div>
            </form>

            {/* Loading State */}
            {loading && (
              <div
                className="mt-6 flex items-center gap-3 p-4 rounded-xl border"
                style={{
                  background: 'rgb(var(--primary) / 0.08)',
                  borderColor: 'rgb(var(--primary) / 0.2)',
                }}
                data-icod-id="src_pages_websitecloner_tsx_aca7">
                <Spinner size="md" data-icod-id="src_pages_websitecloner_tsx_603d" />
                <div data-icod-id="src_pages_websitecloner_tsx_loadtxt">
                  <p
                    className="text-sm font-medium"
                    style={{ color: 'rgb(var(--muted-foreground))' }}
                    data-icod-id="src_pages_websitecloner_tsx_d46e">
                    Cloning... this can take a few seconds.
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: 'rgb(var(--muted-foreground) / 0.7)' }}
                    data-icod-id="src_pages_websitecloner_tsx_loadsub">
                    Fetching stylesheets, embedding images, removing scripts...
                  </p>
                </div>
              </div>
            )}

            {/* Success Result */}
            {result && !loading && (
              <div
                className="mt-6 p-5 rounded-xl border animate-fade-in-up"
                style={{
                  background: 'rgb(var(--success) / 0.08)',
                  borderColor: 'rgb(var(--success) / 0.3)',
                }}
                data-icod-id="src_pages_websitecloner_tsx_0282">
                <div
                  className="flex items-start gap-3 mb-4"
                  data-icod-id="src_pages_websitecloner_tsx_7462">
                  <div
                    className="flex-shrink-0 mt-0.5 h-6 w-6 rounded-full flex items-center justify-center"
                    style={{ background: 'rgb(var(--success) / 0.2)' }}
                    data-icod-id="src_pages_websitecloner_tsx_f7a8">
                    <Check
                      className="h-4 w-4"
                      style={{ color: 'rgb(var(--success))' }}
                      data-icod-id="src_pages_websitecloner_tsx_fd29" />
                  </div>
                  <div
                    className="flex-1 min-w-0"
                    data-icod-id="src_pages_websitecloner_tsx_624d">
                    <h3
                      className="font-semibold mb-1"
                      style={{ color: 'rgb(var(--foreground))' }}
                      data-icod-id="src_pages_websitecloner_tsx_b2cb">
                      Single-file clone created!
                    </h3>
                    <div
                      className="space-y-1 text-sm"
                      style={{ color: 'rgb(var(--muted-foreground))' }}
                      data-icod-id="src_pages_websitecloner_tsx_a23d">
                      <p className="truncate" data-icod-id="src_pages_websitecloner_tsx_3b0e">
                        {result.source}
                      </p>
                      <div
                        className="flex flex-wrap gap-x-4 gap-y-1 text-xs"
                        data-icod-id="src_pages_websitecloner_tsx_347a">
                        <span
                          className="flex items-center gap-1"
                          data-icod-id="src_pages_websitecloner_tsx_1145">
                          <Hash className="h-3 w-3" data-icod-id="src_pages_websitecloner_tsx_595a" />
                          ID: {result.id.slice(0, 8)}...
                        </span>
                        <span
                          className="flex items-center gap-1"
                          data-icod-id="src_pages_websitecloner_tsx_8b31">
                          <HardDrive className="h-3 w-3" data-icod-id="src_pages_websitecloner_tsx_a0e2" />
                          {formatBytes(result.bytes)}
                        </span>
                        <span
                          className="flex items-center gap-1"
                          data-icod-id="src_pages_websitecloner_tsx_e28d">
                          <Clock className="h-3 w-3" data-icod-id="src_pages_websitecloner_tsx_e037" />
                          {formatDate(result.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="flex flex-wrap gap-3"
                  data-icod-id="src_pages_websitecloner_tsx_6166">
                  <a
                    href={getPreviewUrl(result.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                    style={{
                      background: 'rgb(var(--primary))',
                      color: 'rgb(var(--primary-foreground))',
                    }}
                    data-icod-id="src_pages_websitecloner_tsx_31bf">
                    <ExternalLink className="h-4 w-4" data-icod-id="src_pages_websitecloner_tsx_43c0" />
                    Preview
                  </a>
                  <a
                    href={getDownloadUrl(result.id)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all duration-200"
                    style={{
                      borderColor: 'rgb(var(--border))',
                      color: 'rgb(var(--foreground))',
                      background: 'rgb(var(--surface))',
                    }}
                    data-icod-id="src_pages_websitecloner_tsx_8db4">
                    <Download className="h-4 w-4" data-icod-id="src_pages_websitecloner_tsx_9fcd" />
                    Download
                  </a>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="mt-6" data-icod-id="src_pages_websitecloner_tsx_e5b7">
                <Alert variant="error" data-icod-id="src_pages_websitecloner_tsx_5a7c">{error}</Alert>
              </div>
            )}
          </Card>

          {/* What This Does Section */}
          <div
            className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
            data-icod-id="src_pages_websitecloner_tsx_features">
            <Card className="p-4" data-icod-id="src_pages_websitecloner_tsx_feat1">
              <div
                className="flex items-start gap-3"
                data-icod-id="src_pages_websitecloner_tsx_7405">
                <FileCode
                  className="h-5 w-5 flex-shrink-0 mt-0.5"
                  style={{ color: 'rgb(var(--primary))' }}
                  data-icod-id="src_pages_websitecloner_tsx_feat1icon" />
                <div data-icod-id="src_pages_websitecloner_tsx_feat1txt">
                  <h4
                    className="text-sm font-semibold mb-1"
                    style={{ color: 'rgb(var(--foreground))' }}
                    data-icod-id="src_pages_websitecloner_tsx_feat1title">
                    Styles Inlined
                  </h4>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: 'rgb(var(--muted-foreground))' }}
                    data-icod-id="src_pages_websitecloner_tsx_feat1desc">
                    External CSS files are fetched and embedded directly in the HTML. No external stylesheet dependencies.
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4" data-icod-id="src_pages_websitecloner_tsx_feat2">
              <div
                className="flex items-start gap-3"
                data-icod-id="src_pages_websitecloner_tsx_d752">
                <ImageIcon
                  className="h-5 w-5 flex-shrink-0 mt-0.5"
                  style={{ color: 'rgb(var(--primary))' }}
                  data-icod-id="src_pages_websitecloner_tsx_feat2icon" />
                <div data-icod-id="src_pages_websitecloner_tsx_feat2txt">
                  <h4
                    className="text-sm font-semibold mb-1"
                    style={{ color: 'rgb(var(--foreground))' }}
                    data-icod-id="src_pages_websitecloner_tsx_feat2title">
                    Images Embedded
                  </h4>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: 'rgb(var(--muted-foreground))' }}
                    data-icod-id="src_pages_websitecloner_tsx_feat2desc">
                    Small images (under 50KB) are converted to base64 data URIs and embedded in the file.
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4" data-icod-id="src_pages_websitecloner_tsx_feat3">
              <div
                className="flex items-start gap-3"
                data-icod-id="src_pages_websitecloner_tsx_7243">
                <XCircle
                  className="h-5 w-5 flex-shrink-0 mt-0.5"
                  style={{ color: 'rgb(var(--primary))' }}
                  data-icod-id="src_pages_websitecloner_tsx_feat3icon" />
                <div data-icod-id="src_pages_websitecloner_tsx_feat3txt">
                  <h4
                    className="text-sm font-semibold mb-1"
                    style={{ color: 'rgb(var(--foreground))' }}
                    data-icod-id="src_pages_websitecloner_tsx_feat3title">
                    Scripts Removed
                  </h4>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: 'rgb(var(--muted-foreground))' }}
                    data-icod-id="src_pages_websitecloner_tsx_feat3desc">
                    All JavaScript is stripped for security. The clone is a static visual snapshot only.
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4" data-icod-id="src_pages_websitecloner_tsx_feat4">
              <div
                className="flex items-start gap-3"
                data-icod-id="src_pages_websitecloner_tsx_63b7">
                <Link2
                  className="h-5 w-5 flex-shrink-0 mt-0.5"
                  style={{ color: 'rgb(var(--primary))' }}
                  data-icod-id="src_pages_websitecloner_tsx_feat4icon" />
                <div data-icod-id="src_pages_websitecloner_tsx_feat4txt">
                  <h4
                    className="text-sm font-semibold mb-1"
                    style={{ color: 'rgb(var(--foreground))' }}
                    data-icod-id="src_pages_websitecloner_tsx_feat4title">
                    URLs Made Absolute
                  </h4>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: 'rgb(var(--muted-foreground))' }}
                    data-icod-id="src_pages_websitecloner_tsx_feat4desc">
                    Relative paths are converted to absolute URLs pointing to the original site.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Important Disclaimer */}
          <div
            className="mb-8 flex items-start gap-3 p-4 rounded-xl border text-sm"
            style={{
              borderColor: 'rgb(var(--warning) / 0.3)',
              background: 'rgb(var(--warning) / 0.05)',
              color: 'rgb(var(--muted-foreground))',
            }}
            data-icod-id="src_pages_websitecloner_tsx_39cc">
            <AlertCircle
              className="h-5 w-5 flex-shrink-0 mt-0.5"
              style={{ color: 'rgb(var(--warning))' }}
              data-icod-id="src_pages_websitecloner_tsx_8972" />
            <div data-icod-id="src_pages_websitecloner_tsx_disclaimer">
              <p
                className="font-semibold mb-1"
                style={{ color: 'rgb(var(--foreground))' }}
                data-icod-id="src_pages_websitecloner_tsx_disclaimer_title">
                Visual Clone Only
              </p>
              <p
                className="leading-relaxed"
                data-icod-id="src_pages_websitecloner_tsx_7454">
                This creates a visual copy of a website. Buttons, logins, shopping carts, and other interactive elements will not work in the clone — there is no backend behind it. Best for backup, migration, and redesign starting points.
              </p>
              <p
                className="leading-relaxed mt-2 text-xs"
                style={{ color: 'rgb(var(--muted-foreground) / 0.8)' }}
                data-icod-id="src_pages_websitecloner_tsx_legal">
                Only clone websites you own or have permission to copy. Republishing someone else's site without permission may violate copyright.
              </p>
            </div>
          </div>

          {/* Technical Limits */}
          <div
            className="mb-10 p-4 rounded-xl border"
            style={{
              borderColor: 'rgb(var(--border) / 0.5)',
              background: 'rgb(var(--surface) / 0.3)',
            }}
            data-icod-id="src_pages_websitecloner_tsx_limits">
            <div className="flex items-center gap-2 mb-3" data-icod-id="src_pages_websitecloner_tsx_limitstitle">
              <Info
                className="h-4 w-4"
                style={{ color: 'rgb(var(--muted-foreground))' }}
                data-icod-id="src_pages_websitecloner_tsx_limitsicon" />
              <h4
                className="text-sm font-semibold"
                style={{ color: 'rgb(var(--foreground))' }}
                data-icod-id="src_pages_websitecloner_tsx_limitsh">
                Technical Details
              </h4>
            </div>
            <ul
              className="space-y-1.5 text-xs"
              style={{ color: 'rgb(var(--muted-foreground))' }}
              data-icod-id="src_pages_websitecloner_tsx_limitslist">
              <li className="flex items-center gap-2" data-icod-id="src_pages_websitecloner_tsx_limit1">
                <Shield className="h-3 w-3 flex-shrink-0" data-icod-id="src_pages_websitecloner_tsx_limit1i" />
                Only public http/https pages supported; localhost and private IPs are blocked
              </li>
              <li className="flex items-center gap-2" data-icod-id="src_pages_websitecloner_tsx_limit2">
                <HardDrive className="h-3 w-3 flex-shrink-0" data-icod-id="src_pages_websitecloner_tsx_limit2i" />
                Maximum page size: 3 MB per request
              </li>
              <li className="flex items-center gap-2" data-icod-id="src_pages_websitecloner_tsx_limit3">
                <Clock className="h-3 w-3 flex-shrink-0" data-icod-id="src_pages_websitecloner_tsx_limit3i" />
                15 second timeout per fetch operation
              </li>
              <li className="flex items-center gap-2" data-icod-id="src_pages_websitecloner_tsx_limit4">
                <ImageIcon className="h-3 w-3 flex-shrink-0" data-icod-id="src_pages_websitecloner_tsx_limit4i" />
                Large images remain as absolute URLs (internet needed to display them)
              </li>
              <li className="flex items-center gap-2" data-icod-id="src_pages_websitecloner_tsx_limit5">
                <Clock className="h-3 w-3 flex-shrink-0" data-icod-id="src_pages_websitecloner_tsx_limit5i" />
                Clones are stored for 7 days then automatically deleted
              </li>
            </ul>
          </div>

          {/* Developer Widget Section */}
          <Card
            className="p-5 mb-10"
            data-icod-id="src_pages_websitecloner_tsx_widget">
            <div className="flex items-center gap-2 mb-3" data-icod-id="src_pages_websitecloner_tsx_widgettitle">
              <XCircle
                className="h-5 w-5"
                style={{ color: 'rgb(var(--primary))' }}
                data-icod-id="src_pages_websitecloner_tsx_widgeticon" />
              <h3
                className="text-base font-bold font-heading"
                style={{ color: 'rgb(var(--foreground))' }}
                data-icod-id="src_pages_websitecloner_tsx_widgeth">
                For Developers
              </h3>
            </div>
            <p
              className="text-sm mb-3"
              style={{ color: 'rgb(var(--muted-foreground))' }}
              data-icod-id="src_pages_websitecloner_tsx_widgetdesc">
                Want to add website cloning to your own project? Three integration options are available:
              </p>
            <ul
              className="space-y-2 text-sm"
              style={{ color: 'rgb(var(--muted-foreground))' }}
              data-icod-id="src_pages_websitecloner_tsx_widgetlist">
              <li className="flex items-start gap-2" data-icod-id="src_pages_websitecloner_tsx_witem1">
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'rgb(var(--primary) / 0.15)', color: 'rgb(var(--primary))' }}
                  data-icod-id="src_pages_websitecloner_tsx_witem1n">1</span>
                <span data-icod-id="src_pages_websitecloner_tsx_witem1t">
                  <strong
                    style={{ color: 'rgb(var(--foreground))' }}
                    data-icod-id="src_pages_websitecloner_tsx_aaed">Standalone Server</strong> — Run <code
                  className="px-1.5 py-0.5 rounded text-xs"
                  style={{ background: 'rgb(var(--muted) / 0.3)' }}
                  data-icod-id="src_pages_websitecloner_tsx_80fb">node cloner-server.js</code> on port 4600. Zero dependencies.
                </span>
              </li>
              <li className="flex items-start gap-2" data-icod-id="src_pages_websitecloner_tsx_witem2">
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'rgb(var(--primary) / 0.15)', color: 'rgb(var(--primary))' }}
                  data-icod-id="src_pages_websitecloner_tsx_witem2n">2</span>
                <span data-icod-id="src_pages_websitecloner_tsx_witem2t">
                  <strong
                    style={{ color: 'rgb(var(--foreground))' }}
                    data-icod-id="src_pages_websitecloner_tsx_18d3">Express Router</strong> — Mount the cloner routes into your existing Express backend.
                </span>
              </li>
              <li className="flex items-start gap-2" data-icod-id="src_pages_websitecloner_tsx_witem3">
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'rgb(var(--primary) / 0.15)', color: 'rgb(var(--primary))' }}
                  data-icod-id="src_pages_websitecloner_tsx_witem3n">3</span>
                <span data-icod-id="src_pages_websitecloner_tsx_witem3t">
                  <strong
                    style={{ color: 'rgb(var(--foreground))' }}
                    data-icod-id="src_pages_websitecloner_tsx_1dae">Embeddable Widget</strong> — Paste the widget HTML into any page and point it at your backend.
                </span>
              </li>
            </ul>
          </Card>

          {/* Recent Clones */}
          <section data-icod-id="src_pages_websitecloner_tsx_1982">
            <div
              className="flex items-center gap-2 mb-5"
              data-icod-id="src_pages_websitecloner_tsx_a638">
              <Clock
                className="h-5 w-5"
                style={{ color: 'rgb(var(--primary))' }}
                data-icod-id="src_pages_websitecloner_tsx_073d" />
              <h2
                className="text-xl font-bold font-heading tracking-tight"
                style={{ color: 'rgb(var(--foreground))' }}
                data-icod-id="src_pages_websitecloner_tsx_9580">
                Recent Clones
              </h2>
            </div>

            {clonesLoading ? (
              <div
                className="flex items-center justify-center py-12"
                data-icod-id="src_pages_websitecloner_tsx_39d3">
                <Spinner size="md" data-icod-id="src_pages_websitecloner_tsx_e758" />
              </div>
            ) : recentClones.length === 0 ? (
              <div
                className="text-center py-12 rounded-xl border border-dashed"
                style={{
                  borderColor: 'rgb(var(--border) / 0.5)',
                  color: 'rgb(var(--muted-foreground))',
                }}
                data-icod-id="src_pages_websitecloner_tsx_dd21">
                <Globe
                  className="h-10 w-10 mx-auto mb-3 opacity-40"
                  data-icod-id="src_pages_websitecloner_tsx_8326" />
                <p className="font-medium" data-icod-id="src_pages_websitecloner_tsx_c357">No clones yet</p>
                <p
                  className="text-sm mt-1 opacity-70"
                  data-icod-id="src_pages_websitecloner_tsx_0939">Enter a URL above to create your first clone.</p>
              </div>
            ) : (
              <div className="space-y-3" data-icod-id="src_pages_websitecloner_tsx_e861">
                {recentClones.map((item) => (
                  <Card
                    key={item.id}
                    className={cn(
                      'p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 transition-all duration-200',
                      'hover:border-[rgb(var(--primary)/0.4)]'
                    )}
                    data-icod-id={`src_pages_websitecloner_tsx_1bc2_${item.id}`}>
                    <div
                      className="flex-1 min-w-0"
                      data-icod-id={`src_pages_websitecloner_tsx_41f0_${item.id}`}>
                      <div
                        className="flex items-center gap-2 mb-1"
                        data-icod-id={`src_pages_websitecloner_tsx_f977_${item.id}`}>
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: 'rgb(var(--foreground))' }}
                          data-icod-id={`src_pages_websitecloner_tsx_951f_${item.id}`}>
                          {item.source}
                        </p>
                        <button
                          onClick={() => copyUrl(item.source, item.id)}
                          className="flex-shrink-0 p-1 rounded hover:bg-[rgb(var(--muted)/0.2)] transition-colors"
                          aria-label="Copy URL"
                          title="Copy URL"
                          data-icod-id={`src_pages_websitecloner_tsx_91c9_${item.id}`}>
                          {copiedId === item.id ? (
                            <Check
                              className="h-3.5 w-3.5"
                              style={{ color: 'rgb(var(--success))' }}
                              data-icod-id={`src_pages_websitecloner_tsx_3114_${item.id}`} />
                          ) : (
                            <Copy
                              className="h-3.5 w-3.5"
                              style={{ color: 'rgb(var(--muted-foreground))' }}
                              data-icod-id={`src_pages_websitecloner_tsx_f772_${item.id}`} />
                          )}
                        </button>
                      </div>
                      <div
                        className="flex items-center gap-3 text-xs"
                        style={{ color: 'rgb(var(--muted-foreground))' }}
                        data-icod-id={`src_pages_websitecloner_tsx_8a45_${item.id}`}>
                        <span
                          className="flex items-center gap-1"
                          data-icod-id={`src_pages_websitecloner_tsx_3a7c_${item.id}`}>
                          <Clock
                            className="h-3 w-3"
                            data-icod-id={`src_pages_websitecloner_tsx_6c7f_${item.id}`} />
                          {formatDate(item.createdAt)}
                        </span>
                        <span
                          className="flex items-center gap-1"
                          data-icod-id={`src_pages_websitecloner_tsx_985b_${item.id}`}>
                          <HardDrive
                            className="h-3 w-3"
                            data-icod-id={`src_pages_websitecloner_tsx_c9f1_${item.id}`} />
                          {formatBytes(item.bytes)}
                        </span>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-2 flex-shrink-0"
                      data-icod-id={`src_pages_websitecloner_tsx_923b_${item.id}`}>
                      <a
                        href={getPreviewUrl(item.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        style={{
                          background: 'rgb(var(--primary) / 0.12)',
                          color: 'rgb(var(--primary-hover))',
                        }}
                        data-icod-id={`src_pages_websitecloner_tsx_3f00_${item.id}`}>
                        <ExternalLink
                          className="h-3.5 w-3.5"
                          data-icod-id={`src_pages_websitecloner_tsx_19b2_${item.id}`} />
                        Preview
                      </a>
                      <a
                        href={getDownloadUrl(item.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                        style={{
                          borderColor: 'rgb(var(--border))',
                          color: 'rgb(var(--muted-foreground))',
                        }}
                        data-icod-id={`src_pages_websitecloner_tsx_7db2_${item.id}`}>
                        <Download
                          className="h-3.5 w-3.5"
                          data-icod-id={`src_pages_websitecloner_tsx_f3e1_${item.id}`} />
                        Download
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
