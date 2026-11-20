import { useState } from 'react';
import { ExternalLink, Monitor, Smartphone, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui';
import { cn } from '@/utils/cn';
import { getAssetUrl } from '@/utils/assetUrl';

/**
 * Resolve an ad's imageUrl to a fully-qualified URL.
 * - Paths starting with `/uploads/` are resolved through getAssetUrl().
 * - Absolute URLs (http/https) pointing to actual images pass through.
 * - Empty strings or non-image URLs return empty string.
 */
function resolveAdImageUrl(imageUrl: string | undefined): string {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('uploads/')) {
    try {
      return getAssetUrl(imageUrl);
    } catch {
      return '';
    }
  }
  if (/^https?:\/\//i.test(imageUrl)) {
    const hasImageExt = /\.(webp|png|jpg|jpeg|gif|svg|ico)(\?.*)?$/i.test(imageUrl);
    const isUploadPath = /\/uploads\//i.test(imageUrl);
    if (hasImageExt || isUploadPath) return imageUrl;
    return '';
  }
  return '';
}

/** Extract first 2 uppercase chars of advertiser name for fallback initials */
function getBrandInitials(name: string): string {
  return (name || 'AD').replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'AD';
}

interface AdPreviewData {
  advertiserName: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
}

interface AdPreviewPanelProps {
  data: AdPreviewData;
  className?: string;
}

export default function AdPreviewPanel({ data, className }: AdPreviewPanelProps) {
  const hasContent = data.title.trim().length > 0;
  const [bannerImgFailed, setBannerImgFailed] = useState(false);
  const [sidebarImgFailed, setSidebarImgFailed] = useState(false);
  const resolvedImage = resolveAdImageUrl(data.imageUrl);
  const brandInitials = getBrandInitials(data.advertiserName);

  return (
    <Card className={cn('p-6', className)} data-icod-id="ad_preview_panel_root">
      <div className="flex items-center gap-2 mb-5" data-icod-id="ad_preview_panel_header">
        <Monitor className="h-5 w-5 text-primary" data-icod-id="ad_preview_panel_icon" />
        <h3 className="font-semibold text-foreground font-heading" data-icod-id="ad_preview_panel_title">
          Live Preview
        </h3>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20" data-icod-id="ad_preview_panel_badge">
          <RefreshCw className="h-3 w-3 animate-spin-slow" data-icod-id="ad_preview_panel_refresh_icon" />
          Rotates every 8s
        </span>
      </div>

      {!hasContent ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center" data-icod-id="ad_preview_panel_empty">
          <p className="text-sm text-muted-foreground" data-icod-id="ad_preview_panel_empty_text">
            Start filling in the form to see your ad preview here
          </p>
        </div>
      ) : (
        <div className="space-y-6" data-icod-id="ad_preview_panel_content">
          {/* Banner Format Preview */}
          <div data-icod-id="ad_preview_panel_banner_section">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2" data-icod-id="ad_preview_panel_banner_label">
              Banner Format
            </p>
            <div className="rounded-xl border border-border/40 bg-background overflow-hidden shadow-sm" data-icod-id="ad_preview_panel_banner_frame">
              {/* Mock browser chrome */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/50 border-b border-border/40" data-icod-id="ad_preview_panel_browser_chrome">
                <div className="flex gap-1" data-icod-id="ad_preview_panel_dots">
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" data-icod-id="ad_preview_panel_dot_red" />
                  <div className="h-2.5 w-2.5 rounded-full bg-warning/60" data-icod-id="ad_preview_panel_dot_yellow" />
                  <div className="h-2.5 w-2.5 rounded-full bg-success/60" data-icod-id="ad_preview_panel_dot_green" />
                </div>
                <div className="ml-2 flex-1 rounded-md bg-background/80 px-2 py-0.5 text-[10px] text-muted-foreground truncate" data-icod-id="ad_preview_panel_url_bar">
                  mg-blessed-beginnings.com
                </div>
              </div>
              {/* Ad render - mirrors AdSenseSlot horizontal format */}
              <div className="p-4 bg-card" data-icod-id="ad_preview_panel_banner_render">
                {data.targetUrl ? (
                  <a
                    href={data.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="h-24 w-full rounded-xl border border-border/60 bg-card overflow-hidden flex items-center gap-4 px-5 group transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(147,51,234,0.1)]"
                    data-icod-id="ad_preview_panel_banner_link"
                  >
                    {resolvedImage && !bannerImgFailed ? (
                      <img
                        src={resolvedImage}
                        alt={data.title}
                        className="h-full w-auto max-w-[120px] object-cover rounded-lg"
                        onError={() => setBannerImgFailed(true)}
                        data-icod-id="ad_preview_panel_banner_img"
                      />
                    ) : (
                      <div
                        className="h-16 w-16 shrink-0 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg bg-primary"
                        data-icod-id="ad_preview_panel_banner_img_fallback"
                      >
                        {brandInitials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0" data-icod-id="ad_preview_panel_banner_text">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors" data-icod-id="ad_preview_panel_banner_title">
                        {data.title}
                      </p>
                      {data.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5" data-icod-id="ad_preview_panel_banner_desc">
                          {data.description}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider" data-icod-id="ad_preview_panel_banner_sponsored">
                        Sponsored <ExternalLink className="h-3 w-3" data-icod-id="ad_preview_panel_banner_ext" />
                      </span>
                    </div>
                  </a>
                ) : (
                  <div className="h-24 w-full rounded-xl border border-border/60 bg-card overflow-hidden flex items-center gap-4 px-5" data-icod-id="ad_preview_panel_banner_static">
                    {resolvedImage && !bannerImgFailed ? (
                      <img
                        src={resolvedImage}
                        alt={data.title}
                        className="h-full w-auto max-w-[120px] object-cover rounded-lg"
                        onError={() => setBannerImgFailed(true)}
                        data-icod-id="ad_preview_panel_banner_static_img"
                      />
                    ) : (
                      <div
                        className="h-16 w-16 shrink-0 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg bg-primary"
                        data-icod-id="ad_preview_panel_banner_static_img_fallback"
                      >
                        {brandInitials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0" data-icod-id="ad_preview_panel_banner_static_text">
                      <p className="text-sm font-semibold text-foreground truncate" data-icod-id="ad_preview_panel_banner_static_title">
                        {data.title}
                      </p>
                      {data.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5" data-icod-id="ad_preview_panel_banner_static_desc">
                          {data.description}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider" data-icod-id="ad_preview_panel_banner_static_sponsored">
                        Sponsored
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Format Preview */}
          <div data-icod-id="ad_preview_panel_sidebar_section">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2" data-icod-id="ad_preview_panel_sidebar_label">
              Sidebar Format
            </p>
            <div className="rounded-xl border border-border/40 bg-background overflow-hidden shadow-sm max-w-[280px]" data-icod-id="ad_preview_panel_sidebar_frame">
              {/* Mock browser chrome */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/50 border-b border-border/40" data-icod-id="ad_preview_panel_sidebar_chrome">
                <div className="flex gap-1" data-icod-id="ad_preview_panel_sidebar_dots">
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" data-icod-id="ad_preview_panel_sidebar_dot_red" />
                  <div className="h-2.5 w-2.5 rounded-full bg-warning/60" data-icod-id="ad_preview_panel_sidebar_dot_yellow" />
                  <div className="h-2.5 w-2.5 rounded-full bg-success/60" data-icod-id="ad_preview_panel_sidebar_dot_green" />
                </div>
                <div className="ml-2 flex-1 rounded-md bg-background/80 px-2 py-0.5 text-[10px] text-muted-foreground truncate" data-icod-id="ad_preview_panel_sidebar_url">
                  mg-blessed-beginnings.com
                </div>
              </div>
              {/* Ad render - mirrors AdSenseSlot vertical format */}
              <div className="p-4 bg-card" data-icod-id="ad_preview_panel_sidebar_render">
                {data.targetUrl ? (
                  <a
                    href={data.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="h-80 w-full rounded-xl border border-border/60 bg-card overflow-hidden flex flex-col group transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(147,51,234,0.1)]"
                    data-icod-id="ad_preview_panel_sidebar_link"
                  >
                    {resolvedImage && !sidebarImgFailed ? (
                      <div className="h-32 w-full overflow-hidden shrink-0" data-icod-id="ad_preview_panel_sidebar_img_wrap">
                        <img
                          src={resolvedImage}
                          alt={data.title}
                          className="h-full w-full object-cover"
                          onError={() => setSidebarImgFailed(true)}
                          data-icod-id="ad_preview_panel_sidebar_img"
                        />
                      </div>
                    ) : (
                      <div className="h-32 w-full shrink-0 flex items-center justify-center bg-primary text-primary-foreground font-bold text-3xl" data-icod-id="ad_preview_panel_sidebar_img_fallback">
                        {brandInitials}
                      </div>
                    )}
                    <div className="flex-1 p-4 flex flex-col justify-center" data-icod-id="ad_preview_panel_sidebar_text">
                      <p className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors" data-icod-id="ad_preview_panel_sidebar_title">
                        {data.title}
                      </p>
                      {data.description && (
                        <p className="text-xs text-muted-foreground line-clamp-3 mt-1.5" data-icod-id="ad_preview_panel_sidebar_desc">
                          {data.description}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1 mt-3 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider" data-icod-id="ad_preview_panel_sidebar_sponsored">
                        Sponsored <ExternalLink className="h-3 w-3" data-icod-id="ad_preview_panel_sidebar_ext" />
                      </span>
                    </div>
                  </a>
                ) : (
                  <div className="h-80 w-full rounded-xl border border-border/60 bg-card overflow-hidden flex flex-col" data-icod-id="ad_preview_panel_sidebar_static">
                    {resolvedImage && !sidebarImgFailed ? (
                      <div className="h-32 w-full overflow-hidden shrink-0" data-icod-id="ad_preview_panel_sidebar_static_img_wrap">
                        <img
                          src={resolvedImage}
                          alt={data.title}
                          className="h-full w-full object-cover"
                          onError={() => setSidebarImgFailed(true)}
                          data-icod-id="ad_preview_panel_sidebar_static_img"
                        />
                      </div>
                    ) : (
                      <div className="h-32 w-full shrink-0 flex items-center justify-center bg-primary text-primary-foreground font-bold text-3xl" data-icod-id="ad_preview_panel_sidebar_static_img_fallback">
                        {brandInitials}
                      </div>
                    )}
                    <div className="flex-1 p-4 flex flex-col justify-center" data-icod-id="ad_preview_panel_sidebar_static_text">
                      <p className="text-sm font-semibold text-foreground line-clamp-2" data-icod-id="ad_preview_panel_sidebar_static_title">
                        {data.title}
                      </p>
                      {data.description && (
                        <p className="text-xs text-muted-foreground line-clamp-3 mt-1.5" data-icod-id="ad_preview_panel_sidebar_static_desc">
                          {data.description}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1 mt-3 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider" data-icod-id="ad_preview_panel_sidebar_static_sponsored">
                        Sponsored
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rotation info */}
          <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/10 px-4 py-3" data-icod-id="ad_preview_panel_rotation_info">
            <Smartphone className="h-4 w-4 text-primary shrink-0" data-icod-id="ad_preview_panel_rotation_icon" />
            <p className="text-xs text-muted-foreground" data-icod-id="ad_preview_panel_rotation_text">
              Your ad will rotate every 8 seconds with other ads across all pages on the site
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
