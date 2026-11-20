import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { PAGE_META } from '@/seo';
import { Card, Spinner, Badge, Button } from '@/components/ui';
import { getMyAdStats, type Ad, type AdStatsResponse } from '@/services/adService';
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  Calendar,
  BarChart3,
  ArrowRight,
  Megaphone,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const adDashboardMeta = PAGE_META['/ad-dashboard'];

export default function AdDashboard() {
  const [data, setData] = useState<AdStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getMyAdStats()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.response?.data?.error || 'Failed to load ad statistics.');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        data-icod-id="src_pages_addashboard_tsx_12d1">
        <Spinner size="lg" data-icod-id="src_pages_addashboard_tsx_f603" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="container mx-auto px-4 py-24 text-center"
        data-icod-id="src_pages_addashboard_tsx_5d5f">
        <h2
          className="text-2xl font-bold text-foreground mb-4"
          data-icod-id="src_pages_addashboard_tsx_caf9">Error</h2>
        <p
          className="text-muted-foreground mb-6"
          data-icod-id="src_pages_addashboard_tsx_e0df">{error}</p>
        <Link to="/advertisement" data-icod-id="src_pages_addashboard_tsx_df16">
          <Button variant="outline" data-icod-id="src_pages_addashboard_tsx_d9a3">Back to Advertisement</Button>
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="container mx-auto px-4 py-24 text-center"
        data-icod-id="src_pages_addashboard_tsx_4068">
        <h2
          className="text-2xl font-bold text-foreground mb-4"
          data-icod-id="src_pages_addashboard_tsx_cd67">No Data Available</h2>
        <p
          className="text-muted-foreground mb-6"
          data-icod-id="src_pages_addashboard_tsx_9d08">You don't have any ads yet.</p>
        <Link to="/advertisement" data-icod-id="src_pages_addashboard_tsx_3623">
          <Button variant="primary" data-icod-id="src_pages_addashboard_tsx_acb9">Create Your First Ad</Button>
        </Link>
      </div>
    );
  }

  const { ads, summary } = data;

  // Calculate max impressions for bar chart scaling
  const maxPageImpressions = Math.max(...summary.topPages.map((p) => p.impressions), 1);

  return (
    <>
      <SEOHead
        title={adDashboardMeta.title}
        description={adDashboardMeta.description}
        canonicalUrl={adDashboardMeta.canonical}
        noindex={adDashboardMeta.noindex}
        data-icod-id="src_pages_addashboard_tsx_c931" />
      <div
        className="container mx-auto px-4 py-12 max-w-6xl"
        data-icod-id="src_pages_addashboard_tsx_bfde">
        {/* Header */}
        <div
          className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-12"
          data-icod-id="src_pages_addashboard_tsx_b83b">
          <div data-icod-id="src_pages_addashboard_tsx_861e">
            <h1
              className="text-4xl md:text-5xl font-black text-foreground font-heading mb-3 tracking-tight"
              style={{ textShadow: '0 2px 16px rgba(157, 106, 255, 0.2)' }}
              data-icod-id="src_pages_addashboard_tsx_77f2">
              My Ad Dashboard
            </h1>
            <p
              className="text-lg text-muted-foreground font-medium"
              data-icod-id="src_pages_addashboard_tsx_930d">
              Track your ad performance and see where your ads appear.
            </p>
          </div>
          <Link to="/advertisement" data-icod-id="src_pages_addashboard_tsx_9d24">
            <Button variant="primary" size="lg" className="font-bold" data-icod-id="src_pages_addashboard_tsx_7cf9">
              <Megaphone className="h-5 w-5 mr-2" data-icod-id="src_pages_addashboard_tsx_ab2b" />
              Create New Ad
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12"
          data-icod-id="src_pages_addashboard_tsx_e7dd">
          <Card className="p-7" data-icod-id="src_pages_addashboard_tsx_a6a0">
            <div
              className="flex items-start justify-between mb-5"
              data-icod-id="src_pages_addashboard_tsx_d718">
              <div
                className="p-3.5 rounded-xl bg-primary/15"
                data-icod-id="src_pages_addashboard_tsx_be49">
                <Eye
                  className="h-7 w-7 text-primary"
                  data-icod-id="src_pages_addashboard_tsx_6f80" />
              </div>
              <Badge
                variant="default"
                className="bg-primary/15 text-primary border-primary/30"
                data-icod-id="src_pages_addashboard_tsx_20e5">
                Total
              </Badge>
            </div>
            <p
              className="text-4xl font-black text-foreground mb-2"
              data-icod-id="src_pages_addashboard_tsx_1b2e">
              {summary.totalImpressions.toLocaleString()}
            </p>
            <p
              className="text-base text-muted-foreground font-semibold"
              data-icod-id="src_pages_addashboard_tsx_d9bd">Total Impressions</p>
          </Card>

          <Card className="p-7" data-icod-id="src_pages_addashboard_tsx_cf82">
            <div
              className="flex items-start justify-between mb-5"
              data-icod-id="src_pages_addashboard_tsx_f549">
              <div
                className="p-3.5 rounded-xl bg-success/15"
                data-icod-id="src_pages_addashboard_tsx_3012">
                <MousePointerClick
                  className="h-7 w-7 text-success"
                  data-icod-id="src_pages_addashboard_tsx_68ed" />
              </div>
              <Badge
                variant="default"
                className="bg-success/15 text-success border-success/30"
                data-icod-id="src_pages_addashboard_tsx_78cd">
                Clicks
              </Badge>
            </div>
            <p
              className="text-4xl font-black text-foreground mb-2"
              data-icod-id="src_pages_addashboard_tsx_4071">
              {summary.totalClicks.toLocaleString()}
            </p>
            <p
              className="text-base text-muted-foreground font-semibold"
              data-icod-id="src_pages_addashboard_tsx_3007">Total Clicks</p>
          </Card>

          <Card className="p-7" data-icod-id="src_pages_addashboard_tsx_bf60">
            <div
              className="flex items-start justify-between mb-5"
              data-icod-id="src_pages_addashboard_tsx_3866">
              <div
                className="p-3.5 rounded-xl bg-warning/15"
                data-icod-id="src_pages_addashboard_tsx_369e">
                <TrendingUp
                  className="h-7 w-7 text-warning"
                  data-icod-id="src_pages_addashboard_tsx_9c43" />
              </div>
              <Badge
                variant="default"
                className="bg-warning/15 text-warning border-warning/30"
                data-icod-id="src_pages_addashboard_tsx_a507">
                CTR
              </Badge>
            </div>
            <p
              className="text-4xl font-black text-foreground mb-2"
              data-icod-id="src_pages_addashboard_tsx_0201">{summary.ctr}%</p>
            <p
              className="text-base text-muted-foreground font-semibold"
              data-icod-id="src_pages_addashboard_tsx_3702">Click-Through Rate</p>
          </Card>

          <Card className="p-7" data-icod-id="src_pages_addashboard_tsx_955d">
            <div
              className="flex items-start justify-between mb-5"
              data-icod-id="src_pages_addashboard_tsx_d0cf">
              <div
                className="p-3.5 rounded-xl bg-accent/15"
                data-icod-id="src_pages_addashboard_tsx_cdc1">
                <Calendar
                  className="h-7 w-7 text-accent"
                  data-icod-id="src_pages_addashboard_tsx_5e46" />
              </div>
              <Badge
                variant="default"
                className="bg-accent/15 text-accent border-accent/30"
                data-icod-id="src_pages_addashboard_tsx_58ea">
                Days Left
              </Badge>
            </div>
            <p
              className="text-4xl font-black text-foreground mb-2"
              data-icod-id="src_pages_addashboard_tsx_36b0">{summary.daysRemaining}</p>
            <p
              className="text-base text-muted-foreground font-semibold"
              data-icod-id="src_pages_addashboard_tsx_bc3d">Days Remaining</p>
          </Card>
        </div>

        {/* Projected Monthly Stats */}
        <Card
          className="p-7 mb-12 bg-gradient-to-r from-primary/8 to-transparent border-primary/30"
          data-icod-id="src_pages_addashboard_tsx_ab14">
          <div
            className="flex flex-col md:flex-row md:items-center justify-between gap-5"
            data-icod-id="src_pages_addashboard_tsx_cf62">
            <div
              className="flex items-center gap-5"
              data-icod-id="src_pages_addashboard_tsx_9c47">
              <div
                className="p-4 rounded-xl bg-primary/15"
                data-icod-id="src_pages_addashboard_tsx_a609">
                <BarChart3
                  className="h-7 w-7 text-primary"
                  data-icod-id="src_pages_addashboard_tsx_3518" />
              </div>
              <div data-icod-id="src_pages_addashboard_tsx_6465">
                <h3
                  className="font-bold text-lg text-foreground"
                  data-icod-id="src_pages_addashboard_tsx_8ef2">Projected Monthly Performance</h3>
                <p
                  className="text-base text-muted-foreground font-medium"
                  data-icod-id="src_pages_addashboard_tsx_660e">
                  Based on your current daily average of {summary.dailyAverage.toLocaleString()} impressions
                </p>
              </div>
            </div>
            <div className="text-right" data-icod-id="src_pages_addashboard_tsx_6d09">
              <p
                className="text-3xl font-black text-primary"
                data-icod-id="src_pages_addashboard_tsx_8894">
                ~{summary.projectedMonthly.toLocaleString()}
              </p>
              <p
                className="text-sm text-muted-foreground font-semibold"
                data-icod-id="src_pages_addashboard_tsx_0e61">estimated impressions/month</p>
            </div>
          </div>
        </Card>

        {/* Where Your Ads Appear */}
        {summary.topPages.length > 0 && (
          <div className="mb-12" data-icod-id="src_pages_addashboard_tsx_fe96">
            <h2
              className="text-2xl font-bold text-foreground mb-7 flex items-center gap-3"
              data-icod-id="src_pages_addashboard_tsx_bb9f">
              <ExternalLink
                className="h-5 w-5 text-primary"
                data-icod-id="src_pages_addashboard_tsx_ff82" />
              Where Your Ads Appear
            </h2>
            <Card className="p-6" data-icod-id="src_pages_addashboard_tsx_321c">
              <div className="space-y-4" data-icod-id="src_pages_addashboard_tsx_7c28">
                {summary.topPages.map((page) => (
                  <div
                    key={page.page}
                    className="flex items-center gap-4"
                    data-icod-id={`src_pages_addashboard_tsx_94bb_${page.page}`}>
                    <div
                      className="w-32 sm:w-48 truncate text-sm font-medium text-foreground"
                      title={page.page}
                      data-icod-id={`src_pages_addashboard_tsx_8a59_${page.page}`}>
                      {page.page === '/' ? 'Home Page' : page.page}
                    </div>
                    <div
                      className="flex-1"
                      data-icod-id={`src_pages_addashboard_tsx_ff61_${page.page}`}>
                      <div
                        className="h-6 bg-muted rounded-full overflow-hidden"
                        data-icod-id={`src_pages_addashboard_tsx_f3cb_${page.page}`}>
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${(page.impressions / maxPageImpressions) * 100}%` }}
                          data-icod-id={`src_pages_addashboard_tsx_d242_${page.page}`} />
                      </div>
                    </div>
                    <div
                      className="w-20 text-right text-sm font-semibold text-foreground"
                      data-icod-id={`src_pages_addashboard_tsx_38a2_${page.page}`}>
                      {page.impressions.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Your Ads List */}
        <div data-icod-id="src_pages_addashboard_tsx_205f">
          <h2
            className="text-xl font-bold text-foreground mb-6"
            data-icod-id="src_pages_addashboard_tsx_5ad7">Your Ads</h2>
          <div className="space-y-4" data-icod-id="src_pages_addashboard_tsx_e614">
            {ads.map((ad) => (
              <Card
                key={ad._id}
                className="p-6"
                data-icod-id={`src_pages_addashboard_tsx_4df0_${ad._id}`}>
                <div
                  className="flex flex-col md:flex-row md:items-center gap-4"
                  data-icod-id={`src_pages_addashboard_tsx_6345_${ad._id}`}>
                  {/* Ad Image */}
                  {ad.imageUrl && (
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-20 h-20 object-cover rounded-lg shrink-0"
                      data-icod-id={`src_pages_addashboard_tsx_2674_${ad._id}`} />
                  )}

                  {/* Ad Info */}
                  <div
                    className="flex-1 min-w-0"
                    data-icod-id={`src_pages_addashboard_tsx_7277_${ad._id}`}>
                    <div
                      className="flex items-center gap-2 mb-1"
                      data-icod-id={`src_pages_addashboard_tsx_090f_${ad._id}`}>
                      <h3
                        className="font-semibold text-foreground truncate"
                        data-icod-id={`src_pages_addashboard_tsx_61a7_${ad._id}`}>{ad.title}</h3>
                      <Badge
                        variant={
                          ad.status === 'active'
                            ? 'default'
                            : ad.status === 'expired'
                              ? 'default'
                              : 'category'
                        }
                        className={cn(
                          ad.status === 'active' && 'bg-success/10 text-success border-success/20',
                          ad.status === 'expired' && 'bg-destructive/10 text-destructive border-destructive/20',
                          ad.status === 'pending' && 'bg-warning/10 text-warning border-warning/20',
                        )}
                        data-icod-id={`src_pages_addashboard_tsx_7d02_${ad._id}`}>
                        {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                      </Badge>
                    </div>
                    {ad.description && (
                      <p
                        className="text-sm text-muted-foreground line-clamp-1 mb-2"
                        data-icod-id={`src_pages_addashboard_tsx_449a_${ad._id}`}>
                        {ad.description}
                      </p>
                    )}
                    <div
                      className="flex flex-wrap gap-4 text-xs text-muted-foreground"
                      data-icod-id={`src_pages_addashboard_tsx_00b9_${ad._id}`}>
                      {ad.expiresAt && (
                        <span data-icod-id={`src_pages_addashboard_tsx_fea8_${ad._id}`}>Expires: {new Date(ad.expiresAt).toLocaleDateString()}</span>
                      )}
                      {ad.purchasedAt && (
                        <span data-icod-id={`src_pages_addashboard_tsx_8849_${ad._id}`}>Purchased: {new Date(ad.purchasedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Ad Stats */}
                  <div
                    className="flex items-center gap-6 shrink-0"
                    data-icod-id={`src_pages_addashboard_tsx_2f6b_${ad._id}`}>
                    <div
                      className="text-center"
                      data-icod-id={`src_pages_addashboard_tsx_6912_${ad._id}`}>
                      <p
                        className="text-lg font-bold text-foreground"
                        data-icod-id={`src_pages_addashboard_tsx_b18b_${ad._id}`}>
                        {(ad.impressions || 0).toLocaleString()}
                      </p>
                      <p
                        className="text-xs text-muted-foreground"
                        data-icod-id={`src_pages_addashboard_tsx_2330_${ad._id}`}>Impressions</p>
                    </div>
                    <div
                      className="text-center"
                      data-icod-id={`src_pages_addashboard_tsx_9212_${ad._id}`}>
                      <p
                        className="text-lg font-bold text-foreground"
                        data-icod-id={`src_pages_addashboard_tsx_7f65_${ad._id}`}>
                        {(ad.clicks || 0).toLocaleString()}
                      </p>
                      <p
                        className="text-xs text-muted-foreground"
                        data-icod-id={`src_pages_addashboard_tsx_ab39_${ad._id}`}>Clicks</p>
                    </div>
                    <div
                      className="text-center"
                      data-icod-id={`src_pages_addashboard_tsx_f6f5_${ad._id}`}>
                      <p
                        className="text-lg font-bold text-foreground"
                        data-icod-id={`src_pages_addashboard_tsx_a4d5_${ad._id}`}>
                        {ad.impressions && ad.clicks
                          ? ((ad.clicks / ad.impressions) * 100).toFixed(1)
                          : '0.0'}
                        %
                      </p>
                      <p
                        className="text-xs text-muted-foreground"
                        data-icod-id={`src_pages_addashboard_tsx_e5ff_${ad._id}`}>CTR</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {ads.length === 0 && (
              <Card
                className="p-12 text-center"
                data-icod-id="src_pages_addashboard_tsx_7d12">
                <Megaphone
                  className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4"
                  data-icod-id="src_pages_addashboard_tsx_3ebc" />
                <h3
                  className="text-lg font-semibold text-foreground mb-2"
                  data-icod-id="src_pages_addashboard_tsx_c7ab">No Ads Yet</h3>
                <p
                  className="text-muted-foreground mb-6"
                  data-icod-id="src_pages_addashboard_tsx_56ce">
                  Create your first ad to start tracking impressions and clicks.
                </p>
                <Link to="/advertisement" data-icod-id="src_pages_addashboard_tsx_1e52">
                  <Button variant="primary" data-icod-id="src_pages_addashboard_tsx_862a">
                    Create Your First Ad
                    <ArrowRight className="h-4 w-4 ml-2" data-icod-id="src_pages_addashboard_tsx_1ab3" />
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
