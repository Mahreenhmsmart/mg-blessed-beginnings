import { useState, useMemo } from 'react';
import {
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Package,
  BarChart3,
  Search,
  Tag,
  Image as ImageIcon,
  Sparkles,
  Store,
  ShoppingBag,
  Globe,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Percent,
  Calculator,
  FileText,
  Link2,
  Zap,
  Shield,
  Eye,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { aiService } from '@/services/aiService';
import { Button, Card, Badge, Input, Spinner, Alert, Field, EmptyState } from '@/components/ui';
import { inputClass } from '@/components/ui/Input';
import { cn } from '@/utils/cn';

// ─── Tab definitions ────────────────────────────────────────────────────────

type TabId =
  | 'product-research'
  | 'listing-optimization'
  | 'profit-calculator'
  | 'shopify-tools'
  | 'ebay-tools'
  | 'product-seo';

interface TabDef {
  id: TabId;
  label: string;
  icon: typeof ShoppingCart;
}

const TABS: TabDef[] = [
  { id: 'product-research', label: 'Product Research', icon: Search },
  { id: 'listing-optimization', label: 'Listing Optimization', icon: Sparkles },
  { id: 'profit-calculator', label: 'Profit Calculator', icon: Calculator },
  { id: 'shopify-tools', label: 'Shopify Tools', icon: Store },
  { id: 'ebay-tools', label: 'eBay Tools', icon: ShoppingBag },
  { id: 'product-seo', label: 'Product SEO', icon: Globe },
];

// ─── Product Research ───────────────────────────────────────────────────────

interface ResearchResult {
  niche: string;
  demandScore: number;
  competitionLevel: 'Low' | 'Medium' | 'High';
  estimatedRevenueRange: string;
  insights: string;
}

function ProductResearchTab() {
  const dispatch = useAppDispatch();
  const [niche, setNiche] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);

  const handleAnalyze = async () => {
    if (!niche.trim()) {
      dispatch(addToast({ message: 'Please enter a product niche to analyze.', variant: 'error' }));
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const prompt = `Analyze this e-commerce product niche and provide structured insights in JSON format:
Niche: ${niche}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${priceRange ? `Price Range: ${priceRange}` : ''}

Respond with valid JSON only (no markdown fences):
{
  "niche": "${niche}",
  "demandScore": <number 1-10>,
  "competitionLevel": "Low" | "Medium" | "High",
  "estimatedRevenueRange": "$X,XXX - $XX,XXX monthly",
  "insights": "<detailed paragraph about market opportunity, trends, recommended strategies>"
}`;
      const response = await aiService.chat(prompt, 'You are an e-commerce market research analyst.');
      if (response.success && response.data?.response) {
        const cleaned = response.data.response.replace(/```json\n?|```/g, '').trim();
        const parsed = JSON.parse(cleaned) as ResearchResult;
        setResult(parsed);
        dispatch(addToast({ message: 'Product research complete!', variant: 'success' }));
      } else {
        dispatch(addToast({ message: 'AI analysis failed. Please try again.', variant: 'error' }));
      }
    } catch {
      dispatch(addToast({ message: 'Failed to connect to AI service.', variant: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const competitionColor: Record<string, string> = {
    Low: 'text-success',
    Medium: 'text-warning',
    High: 'text-destructive',
  };

  return (
    <div
      className="flex flex-col gap-6"
      data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_b995">
      <Card
        className="p-6"
        data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_7865">
        <h3
          className="mb-4 text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_695b">Niche Analysis</h3>
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_d4a6">
          <Field
            label="Product Niche"
            htmlFor="pr-niche"
            required
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_ebc0">
            <Input
              id="pr-niche"
              placeholder="e.g., eco-friendly yoga mats"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_04be" />
          </Field>
          <Field
            label="Target Audience"
            htmlFor="pr-audience"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_bde1">
            <Input
              id="pr-audience"
              placeholder="e.g., health-conscious millennials"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_991b" />
          </Field>
          <Field
            label="Price Range"
            htmlFor="pr-price"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_7519">
            <Input
              id="pr-price"
              placeholder="e.g., $20-$50"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_822e" />
          </Field>
        </div>
        <div
          className="mt-4"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_0571">
          <Button
            onClick={handleAnalyze}
            loading={loading}
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_2cd3">
            <Search
              className="h-4 w-4"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_5a71" />
            Analyze Niche
          </Button>
        </div>
      </Card>
      {loading && (
        <div
          className="flex items-center justify-center py-12"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_d276">
          <Spinner
            size="lg"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_8522" />
        </div>
      )}
      {result && !loading && (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_bd9b">
          <Card
            className="p-5"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_0092">
            <div
              className="flex items-center gap-2 text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_9104">
              <TrendingUp
                className="h-4 w-4"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_3da8" />
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_80ac">Demand Score</span>
            </div>
            <p
              className="mt-2 text-3xl font-bold text-foreground"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_bb49">{result.demandScore}/10</p>
            <div
              className="mt-2 h-2 w-full rounded-full bg-muted"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_e9c3">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${result.demandScore * 10}%` }}
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_c2c8" />
            </div>
          </Card>
          <Card
            className="p-5"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_7a5d">
            <div
              className="flex items-center gap-2 text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_c8ee">
              <BarChart3
                className="h-4 w-4"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_4c69" />
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_83e7">Competition</span>
            </div>
            <p
              className={cn('mt-2 text-3xl font-bold', competitionColor[result.competitionLevel] || 'text-foreground')}
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_8021">
              {result.competitionLevel}
            </p>
          </Card>
          <Card
            className="p-5 sm:col-span-2"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_ca3a">
            <div
              className="flex items-center gap-2 text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_4e06">
              <DollarSign
                className="h-4 w-4"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_3f7e" />
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_d3f3">Est. Monthly Revenue</span>
            </div>
            <p
              className="mt-2 text-3xl font-bold text-foreground"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_0967">{result.estimatedRevenueRange}</p>
          </Card>
          <Card
            className="p-5 sm:col-span-2 lg:col-span-4"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_677b">
            <div
              className="flex items-center gap-2 text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_ba2e">
              <Sparkles
                className="h-4 w-4"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_ae64" />
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_48d9">AI Insights</span>
            </div>
            <p
              className="mt-3 leading-relaxed text-foreground"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_84fd">{result.insights}</p>
          </Card>
        </div>
      )}
      {!result && !loading && (
        <EmptyState
          icon={Search}
          title="No analysis yet"
          description="Enter a product niche above to get AI-powered market intelligence."
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_c398" />
      )}
    </div>
  );
}

// ─── Listing Optimization ───────────────────────────────────────────────────

type Platform = 'Shopify' | 'eBay' | 'Etsy';

interface OptimizationResult {
  optimizedTitle: string;
  optimizedDescription: string;
  suggestedTags: string[];
  imageSuggestions: string[];
  platformTips: string[];
}

function ListingOptimizationTab() {
  const dispatch = useAppDispatch();
  const [platform, setPlatform] = useState<Platform>('Shopify');
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);

  const platforms: Platform[] = ['Shopify', 'eBay', 'Etsy'];

  const handleOptimize = async () => {
    if (!currentTitle.trim() && !currentDescription.trim()) {
      dispatch(addToast({ message: 'Please enter at least a title or description.', variant: 'error' }));
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const prompt = `Optimize this ${platform} product listing for maximum visibility and conversions.

Current Title: ${currentTitle || '(not provided)'}
Current Description: ${currentDescription || '(not provided)'}

Respond with valid JSON only (no markdown fences):
{
  "optimizedTitle": "<SEO-optimized title under 80 chars>",
  "optimizedDescription": "<compelling, keyword-rich description>",
  "suggestedTags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "imageSuggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "platformTips": ["tip specific to ${platform}"]
}`;
      const response = await aiService.chat(
        prompt,
        `You are an expert ${platform} listing optimization specialist.`,
      );
      if (response.success && response.data?.response) {
        const cleaned = response.data.response.replace(/```json\n?|```/g, '').trim();
        const parsed = JSON.parse(cleaned) as OptimizationResult;
        setResult(parsed);
        dispatch(addToast({ message: 'Listing optimized successfully!', variant: 'success' }));
      } else {
        dispatch(addToast({ message: 'AI optimization failed. Please try again.', variant: 'error' }));
      }
    } catch {
      dispatch(addToast({ message: 'Failed to connect to AI service.', variant: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col gap-6"
      data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_e2af">
      <Card
        className="p-6"
        data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_788c">
        <h3
          className="mb-4 text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_5925">Listing Optimizer</h3>

        <div
          className="mb-4"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_6d7b">
          <label
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_4861">
            Platform
          </label>
          <div
            className="flex gap-2"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_c467">
            {platforms.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={cn(
                  'rounded-xl border px-4 py-2 text-sm font-medium transition-all',
                  platform === p
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted',
                )}
                data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_6bcd_${p}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div
          className="grid gap-4 lg:grid-cols-2"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_1d97">
          <Field
            label="Current Title"
            htmlFor="lo-title"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_7581">
            <Input
              id="lo-title"
              placeholder="Paste your current product title"
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_33be" />
          </Field>
          <Field
            label="Current Description"
            htmlFor="lo-desc"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_06bd">
            <textarea
              id="lo-desc"
              className={inputClass('min-h-24 resize-none')}
              placeholder="Paste your current product description"
              value={currentDescription}
              onChange={(e) => setCurrentDescription(e.target.value)}
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_7cb9" />
          </Field>
        </div>

        <div
          className="mt-4"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_6371">
          <Button
            onClick={handleOptimize}
            loading={loading}
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_6632">
            <Sparkles
              className="h-4 w-4"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_1bf8" />
            Optimize Listing
          </Button>
        </div>
      </Card>
      {loading && (
        <div
          className="flex items-center justify-center py-12"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_825b">
          <Spinner
            size="lg"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_d4fe" />
        </div>
      )}
      {result && !loading && (
        <div
          className="flex flex-col gap-4"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_5974">
          <Card
            className="p-5"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_c626">
            <div
              className="flex items-center gap-2 text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_b067">
              <FileText
                className="h-4 w-4"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_116a" />
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_fcbf">Optimized Title</span>
            </div>
            <p
              className="mt-2 text-lg font-medium text-foreground"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_8c41">{result.optimizedTitle}</p>
          </Card>

          <Card
            className="p-5"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_f422">
            <div
              className="flex items-center gap-2 text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_8e9d">
              <FileText
                className="h-4 w-4"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_2050" />
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_c2da">Optimized Description</span>
            </div>
            <p
              className="mt-2 whitespace-pre-wrap leading-relaxed text-foreground"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_cd9d">{result.optimizedDescription}</p>
          </Card>

          <div
            className="grid gap-4 sm:grid-cols-2"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_baa4">
            <Card
              className="p-5"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_ce86">
              <div
                className="flex items-center gap-2 text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_ac53">
                <Tag
                  className="h-4 w-4"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_6d6e" />
                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_16ca">Suggested Tags</span>
              </div>
              <div
                className="mt-3 flex flex-wrap gap-2"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_f1ce">
                {result.suggestedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="category"
                    data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_17ff_${tag}`}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card
              className="p-5"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_7659">
              <div
                className="flex items-center gap-2 text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_5e3f">
                <ImageIcon
                  className="h-4 w-4"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_7f89" />
                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_e08d">Image Suggestions</span>
              </div>
              <ul
                className="mt-3 space-y-2"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_9d3a">
                {result.imageSuggestions.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-foreground"
                    data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_a9b1_${i}`}>
                    <ArrowRight
                      className="mt-0.5 h-3 w-3 shrink-0 text-primary"
                      data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_3613_${i}`} />
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card
            className="p-5"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_056a">
            <div
              className="flex items-center gap-2 text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_7e05">
              <Sparkles
                className="h-4 w-4"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_5e03" />
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_4b5a">{platform}-Specific Tips</span>
            </div>
            <ul
              className="mt-3 space-y-2"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_794f">
              {result.platformTips.map((tip, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-foreground"
                  data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_92a5_${i}`}>
                  <CheckCircle2
                    className="mt-0.5 h-3 w-3 shrink-0 text-success"
                    data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_cbd0_${i}`} />
                  {tip}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
      {!result && !loading && (
        <EmptyState
          icon={Sparkles}
          title="No optimization results"
          description="Paste your listing details above and let AI optimize it for your chosen platform."
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_2446" />
      )}
    </div>
  );
}

// ─── Profit Calculator ──────────────────────────────────────────────────────

interface CalcValues {
  productCost: string;
  sellingPrice: string;
  platformFeePercent: string;
  shippingCost: string;
  paymentProcessingPercent: string;
  advertisingCostPerUnit: string;
}

function ProfitCalculatorTab() {
  const [values, setValues] = useState<CalcValues>({
    productCost: '',
    sellingPrice: '',
    platformFeePercent: '',
    shippingCost: '',
    paymentProcessingPercent: '',
    advertisingCostPerUnit: '',
  });

  const handleChange = (field: keyof CalcValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const calc = useMemo(() => {
    const cost = parseFloat(values.productCost) || 0;
    const price = parseFloat(values.sellingPrice) || 0;
    const platformFeePct = parseFloat(values.platformFeePercent) || 0;
    const shipping = parseFloat(values.shippingCost) || 0;
    const processingPct = parseFloat(values.paymentProcessingPercent) || 0;
    const adCost = parseFloat(values.advertisingCostPerUnit) || 0;

    if (price <= 0) return null;

    const platformFee = price * (platformFeePct / 100);
    const processingFee = price * (processingPct / 100);
    const totalCosts = cost + platformFee + shipping + processingFee + adCost;
    const profit = price - totalCosts;
    const margin = price > 0 ? (profit / price) * 100 : 0;
    const roi = cost > 0 ? (profit / cost) * 100 : 0;
    const breakEvenUnits = profit > 0 ? Math.ceil(totalCosts / profit) : 0;

    return {
      platformFee,
      processingFee,
      totalCosts,
      profit,
      margin,
      roi,
      breakEvenUnits,
    };
  }, [values]);

  const metricCards = calc
    ? [
        {
          label: 'Net Profit',
          value: `$${calc.profit.toFixed(2)}`,
          color: calc.profit >= 0 ? 'text-success' : 'text-destructive',
          icon: DollarSign,
        },
        {
          label: 'Profit Margin',
          value: `${calc.margin.toFixed(2)}%`,
          color: calc.margin >= 20 ? 'text-success' : calc.margin >= 10 ? 'text-warning' : 'text-destructive',
          icon: Percent,
        },
        {
          label: 'ROI',
          value: `${calc.roi.toFixed(2)}%`,
          color: calc.roi >= 50 ? 'text-success' : calc.roi >= 20 ? 'text-warning' : 'text-destructive',
          icon: TrendingUp,
        },
        {
          label: 'Break-Even Units',
          value: calc.breakEvenUnits > 0 ? `${calc.breakEvenUnits}` : 'N/A',
          color: 'text-foreground',
          icon: BarChart3,
        },
      ]
    : [];

  return (
    <div
      className="flex flex-col gap-6"
      data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_aaa5">
      <Card
        className="p-6"
        data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_c295">
        <h3
          className="mb-4 text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_2dff">Cost Breakdown</h3>
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_5f37">
          <Field
            label="Product Cost ($)"
            htmlFor="pc-cost"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_a35f">
            <Input
              id="pc-cost"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={values.productCost}
              onChange={handleChange('productCost')}
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_4a6a" />
          </Field>
          <Field
            label="Selling Price ($)"
            htmlFor="pc-price"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_0118">
            <Input
              id="pc-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={values.sellingPrice}
              onChange={handleChange('sellingPrice')}
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_7b8c" />
          </Field>
          <Field
            label="Platform Fee (%)"
            htmlFor="pc-platform"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_4258">
            <Input
              id="pc-platform"
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="e.g., 15"
              value={values.platformFeePercent}
              onChange={handleChange('platformFeePercent')}
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_ff32" />
          </Field>
          <Field
            label="Shipping Cost ($)"
            htmlFor="pc-shipping"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_7ff0">
            <Input
              id="pc-shipping"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={values.shippingCost}
              onChange={handleChange('shippingCost')}
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_13d1" />
          </Field>
          <Field
            label="Payment Processing (%)"
            htmlFor="pc-processing"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_01b7">
            <Input
              id="pc-processing"
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="e.g., 2.9"
              value={values.paymentProcessingPercent}
              onChange={handleChange('paymentProcessingPercent')}
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_2f16" />
          </Field>
          <Field
            label="Advertising Cost / Unit ($)"
            htmlFor="pc-ads"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_609e">
            <Input
              id="pc-ads"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={values.advertisingCostPerUnit}
              onChange={handleChange('advertisingCostPerUnit')}
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_800e" />
          </Field>
        </div>
      </Card>
      {calc && (
        <>
          <div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_1e6b">
            {metricCards.map((m) => (
              <Card
                key={m.label}
                className="p-5"
                data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_70c0_${m.label}`}>
                <div
                  className="flex items-center gap-2 text-muted-foreground"
                  data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_1b8b_${m.label}`}>
                  <m.icon className="h-4 w-4" />
                  <span
                    className="text-xs font-semibold uppercase tracking-wide"
                    data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_51dd_${m.label}`}>{m.label}</span>
                </div>
                <p
                  className={cn('mt-2 text-3xl font-bold', m.color)}
                  data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_59b2_${m.label}`}>{m.value}</p>
              </Card>
            ))}
          </div>

          <Card
            className="p-5"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_4ef9">
            <h4
              className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_73a9">
              Detailed Breakdown
            </h4>
            <div
              className="space-y-2 text-sm"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_ca9f">
              <div
                className="flex justify-between border-b border-border/40 pb-2"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_de72">
                <span
                  className="text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_c1fe">Selling Price</span>
                <span
                  className="font-medium text-foreground"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_cfd0">
                  ${(parseFloat(values.sellingPrice) || 0).toFixed(2)}
                </span>
              </div>
              <div
                className="flex justify-between border-b border-border/40 pb-2"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_1baf">
                <span
                  className="text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_bb2c">Product Cost</span>
                <span
                  className="font-medium text-destructive"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_9a20">
                  -${(parseFloat(values.productCost) || 0).toFixed(2)}
                </span>
              </div>
              <div
                className="flex justify-between border-b border-border/40 pb-2"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_7859">
                <span
                  className="text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_0fe1">Platform Fee</span>
                <span
                  className="font-medium text-destructive"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_8369">-${calc.platformFee.toFixed(2)}</span>
              </div>
              <div
                className="flex justify-between border-b border-border/40 pb-2"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_d4d7">
                <span
                  className="text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_43d1">Payment Processing</span>
                <span
                  className="font-medium text-destructive"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_8ba4">-${calc.processingFee.toFixed(2)}</span>
              </div>
              <div
                className="flex justify-between border-b border-border/40 pb-2"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_1785">
                <span
                  className="text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_6caf">Shipping</span>
                <span
                  className="font-medium text-destructive"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_0025">
                  -${(parseFloat(values.shippingCost) || 0).toFixed(2)}
                </span>
              </div>
              <div
                className="flex justify-between border-b border-border/40 pb-2"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_4677">
                <span
                  className="text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_c6cd">Advertising</span>
                <span
                  className="font-medium text-destructive"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_5fdd">
                  -${(parseFloat(values.advertisingCostPerUnit) || 0).toFixed(2)}
                </span>
              </div>
              <div
                className="flex justify-between pt-2"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_a174">
                <span
                  className="font-semibold text-foreground"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_4a4d">Net Profit per Unit</span>
                <span
                  className={cn('font-bold', calc.profit >= 0 ? 'text-success' : 'text-destructive')}
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_2a62">
                  ${calc.profit.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </>
      )}
      {!calc && (
        <EmptyState
          icon={Calculator}
          title="Enter your costs"
          description="Fill in the fields above to see real-time profit calculations."
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_6db6" />
      )}
    </div>
  );
}

// ─── Shopify Tools ──────────────────────────────────────────────────────────

interface ShopifyCheckItem {
  id: string;
  label: string;
  category: string;
  status: 'unchecked' | 'pass' | 'warning' | 'fail';
}

const SHOPIFY_CHECKLIST: ShopifyCheckItem[] = [
  { id: 'sh-ssl', label: 'SSL certificate active', category: 'Security', status: 'unchecked' },
  { id: 'sh-mobile', label: 'Mobile-responsive theme', category: 'Performance', status: 'unchecked' },
  { id: 'sh-speed', label: 'Page load time < 3 seconds', category: 'Speed', status: 'unchecked' },
  { id: 'sh-images', label: 'Images compressed & lazy-loaded', category: 'Speed', status: 'unchecked' },
  { id: 'sh-checkout', label: 'Streamlined checkout (<=3 steps)', category: 'Conversion', status: 'unchecked' },
  { id: 'sh-payments', label: 'Multiple payment gateways enabled', category: 'Payments', status: 'unchecked' },
  { id: 'sh-shipping', label: 'Shipping rates configured', category: 'Logistics', status: 'unchecked' },
  { id: 'sh-tax', label: 'Tax settings correct for target markets', category: 'Compliance', status: 'unchecked' },
  { id: 'sh-analytics', label: 'Analytics & pixel tracking installed', category: 'Marketing', status: 'unchecked' },
  { id: 'sh-sitemap', label: 'XML sitemap submitted', category: 'SEO', status: 'unchecked' },
  { id: 'sh-robots', label: 'robots.txt configured correctly', category: 'SEO', status: 'unchecked' },
  { id: 'sh-returns', label: 'Return policy page published', category: 'Trust', status: 'unchecked' },
];

const SHOPIFY_APPS = [
  { name: 'Klaviyo', category: 'Email Marketing', desc: 'Advanced email & SMS marketing automation' },
  { name: 'Judge.me', category: 'Reviews', desc: 'Product reviews with photo/video support' },
  { name: 'Printful', category: 'Fulfillment', desc: 'Print-on-demand dropshipping integration' },
  { name: 'Loox', category: 'Visual Reviews', desc: 'Visual UGC and customer photo reviews' },
  { name: 'ReConvert', category: 'Upsell', desc: 'Post-purchase upsell and thank-you page offers' },
  { name: 'Vitals', category: 'All-in-One', desc: '40+ apps in one: reviews, urgency, bundles' },
];

const SPEED_TIPS = [
  'Compress images to WebP format using tinypng.com or Shopify\'s built-in compression',
  'Remove unused apps — each app adds JavaScript overhead to every page',
  'Use a CDN-backed theme with minimal Liquid loops',
  'Defer non-critical CSS and JavaScript below the fold',
  'Enable browser caching with appropriate Cache-Control headers',
  'Minimize custom fonts — use system font stacks where possible',
];

function ShopifyToolsTab() {
  const dispatch = useAppDispatch();
  const [checklist, setChecklist] = useState<ShopifyCheckItem[]>(SHOPIFY_CHECKLIST);
  const [subTab, setSubTab] = useState<'health' | 'apps' | 'speed'>('health');

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'pass' ? 'unchecked' : 'pass' }
          : item,
      ),
    );
  };

  const passCount = checklist.filter((c) => c.status === 'pass').length;
  const totalCount = checklist.length;
  const healthScore = Math.round((passCount / totalCount) * 100);

  const categories = [...new Set(checklist.map((c) => c.category))];

  const subTabs: { id: typeof subTab; label: string; icon: typeof Shield }[] = [
    { id: 'health', label: 'Store Health Check', icon: Shield },
    { id: 'apps', label: 'App Recommendations', icon: Package },
    { id: 'speed', label: 'Speed Optimization', icon: Zap },
  ];

  return (
    <div
      className="flex flex-col gap-6"
      data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_6eef">
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_ab57">
        {subTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all',
              subTab === t.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:bg-muted',
            )}
            data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_b63a_${t.id}`}>
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>
      {subTab === 'health' && (
        <div
          className="flex flex-col gap-4"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_49b4">
          <Card
            className="p-5"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_c853">
            <div
              className="flex items-center justify-between"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_6132">
              <div data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_3e8e">
                <h3
                  className="text-lg font-semibold text-foreground"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_199b">Store Health Score</h3>
                <p
                  className="text-sm text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_9477">
                  {passCount} of {totalCount} checks passed
                </p>
              </div>
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary/20 bg-primary/10"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_a569">
                <span
                  className="text-xl font-bold text-primary"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_fbf5">{healthScore}%</span>
              </div>
            </div>
            <div
              className="mt-3 h-2 w-full rounded-full bg-muted"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_5deb">
              <div
                className="h-2 rounded-full bg-primary transition-all duration-500"
                style={{ width: `${healthScore}%` }}
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_9492" />
            </div>
          </Card>

          {categories.map((cat) => (
            <Card
              key={cat}
              className="p-5"
              data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_e931_${cat}`}>
              <h4
                className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
                data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_ac32_${cat}`}>{cat}</h4>
              <div
                className="space-y-2"
                data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_8267_${cat}`}>
                {checklist
                  .filter((c) => c.category === cat)
                  .map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleCheck(item.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all',
                        item.status === 'pass'
                          ? 'border-success/30 bg-success/10 text-success'
                          : 'border-border bg-card text-foreground hover:bg-muted',
                      )}
                      data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_b77a_${cat}_${item.id}`}>
                      {item.status === 'pass' ? (
                        <CheckCircle2
                          className="h-4 w-4 shrink-0"
                          data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_47d4_${cat}_${item.id}`} />
                      ) : (
                        <div
                          className="h-4 w-4 shrink-0 rounded-full border-2 border-muted-foreground/30"
                          data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_a358_${cat}_${item.id}`} />
                      )}
                      {item.label}
                    </button>
                  ))}
              </div>
            </Card>
          ))}
        </div>
      )}
      {subTab === 'apps' && (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_db3a">
          {SHOPIFY_APPS.map((app) => (
            <Card
              key={app.name}
              className="p-5"
              data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_4735_${app.name}`}>
              <div
                className="flex items-start justify-between"
                data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_96db_${app.name}`}>
                <h4
                  className="font-semibold text-foreground"
                  data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_4d1a_${app.name}`}>{app.name}</h4>
                <Badge
                  variant="default"
                  data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_c78b_${app.name}`}>{app.category}</Badge>
              </div>
              <p
                className="mt-2 text-sm text-muted-foreground"
                data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_6bda_${app.name}`}>{app.desc}</p>
            </Card>
          ))}
        </div>
      )}
      {subTab === 'speed' && (
        <div
          className="flex flex-col gap-4"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_dddc">
          <Alert
            variant="info"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_1dce">
            Speed directly impacts conversion rate. A 1-second delay can reduce conversions by up to 7%.
          </Alert>
          <Card
            className="p-5"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_2a24">
            <h3
              className="mb-4 text-lg font-semibold text-foreground"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_c1f3">Speed Optimization Checklist</h3>
            <div
              className="space-y-3"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_3fe8">
              {SPEED_TIPS.map((tip, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-4"
                  data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_eb73_${i}`}>
                  <Zap
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_ca88_${i}`} />
                  <p
                    className="text-sm text-foreground"
                    data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_48e5_${i}`}>{tip}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── eBay Tools ───────────────────────────────────────────────────────────────

interface EbayListingQuality {
  score: number;
  issues: { field: string; severity: 'error' | 'warning' | 'info'; message: string }[];
}

function EbayToolsTab() {
  const dispatch = useAppDispatch();
  const [subTab, setSubTab] = useState<'quality' | 'comps' | 'fees'>('quality');
  const [listingTitle, setListingTitle] = useState('');
  const [listingDesc, setListingDesc] = useState('');
  const [listingPrice, setListingPrice] = useState('');
  const [listingPhotos, setListingPhotos] = useState('');
  const [qualityLoading, setQualityLoading] = useState(false);
  const [qualityResult, setQualityResult] = useState<EbayListingQuality | null>(null);

  // Fee calculator state
  const [feeSalePrice, setFeeSalePrice] = useState('');
  const [feeCategory, setFeeCategory] = useState('12.9');
  const [feeShipping, setFeeShipping] = useState('');

  const subTabs: { id: typeof subTab; label: string; icon: typeof Eye }[] = [
    { id: 'quality', label: 'Listing Quality Checker', icon: Eye },
    { id: 'comps', label: 'Sold Comps Analyzer', icon: BarChart3 },
    { id: 'fees', label: 'Fee Calculator', icon: DollarSign },
  ];

  const handleQualityCheck = async () => {
    if (!listingTitle.trim()) {
      dispatch(addToast({ message: 'Please enter a listing title.', variant: 'error' }));
      return;
    }
    setQualityLoading(true);
    setQualityResult(null);
    try {
      const prompt = `Analyze this eBay listing for quality and completeness.

Title: ${listingTitle}
Description: ${listingDesc || '(not provided)'}
Price: $${listingPrice || '0'}
Number of Photos: ${listingPhotos || '0'}

Respond with valid JSON only (no markdown fences):
{
  "score": <number 0-100>,
  "issues": [
    { "field": "<field name>", "severity": "error" | "warning" | "info", "message": "<specific actionable feedback>" }
  ]
}`;
      const response = await aiService.chat(prompt, 'You are an eBay listing quality expert.');
      if (response.success && response.data?.response) {
        const cleaned = response.data.response.replace(/```json\n?|```/g, '').trim();
        const parsed = JSON.parse(cleaned) as EbayListingQuality;
        setQualityResult(parsed);
        dispatch(addToast({ message: 'Listing quality check complete!', variant: 'success' }));
      } else {
        dispatch(addToast({ message: 'Analysis failed. Please try again.', variant: 'error' }));
      }
    } catch {
      dispatch(addToast({ message: 'Failed to connect to AI service.', variant: 'error' }));
    } finally {
      setQualityLoading(false);
    }
  };

  const feeCalculation = useMemo(() => {
    const price = parseFloat(feeSalePrice) || 0;
    const shipping = parseFloat(feeShipping) || 0;
    const catRate = parseFloat(feeCategory) || 0;
    if (price <= 0) return null;

    const finalValueFee = (price + shipping) * (catRate / 100);
    const insertionFee = 0; // first 250 free
    const paypalFee = (price + shipping) * 0.029 + 0.30;
    const totalFees = finalValueFee + insertionFee + paypalFee;
    const netProceeds = price - totalFees;

    return { finalValueFee, insertionFee, paypalFee, totalFees, netProceeds };
  }, [feeSalePrice, feeShipping, feeCategory]);

  const severityStyles: Record<string, string> = {
    error: 'border-destructive/30 bg-destructive/10 text-destructive',
    warning: 'border-warning/30 bg-warning/10 text-warning',
    info: 'border-border bg-muted text-muted-foreground',
  };

  const severityIcons: Record<string, typeof AlertTriangle> = {
    error: AlertTriangle,
    warning: AlertTriangle,
    info: CheckCircle2,
  };

  return (
    <div
      className="flex flex-col gap-6"
      data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_c487">
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_3198">
        {subTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all',
              subTab === t.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:bg-muted',
            )}
            data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_2bd2_${t.id}`}>
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>
      {subTab === 'quality' && (
        <div
          className="flex flex-col gap-4"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_0d75">
          <Card
            className="p-6"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_d72f">
            <h3
              className="mb-4 text-lg font-semibold text-foreground"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_dddf">Check Your eBay Listing</h3>
            <div
              className="grid gap-4 sm:grid-cols-2"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_a436">
              <Field
                label="Listing Title"
                htmlFor="eb-title"
                required
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_73d6">
                <Input
                  id="eb-title"
                  placeholder="Enter your eBay listing title"
                  value={listingTitle}
                  onChange={(e) => setListingTitle(e.target.value)}
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_4395" />
              </Field>
              <Field
                label="Price ($)"
                htmlFor="eb-price"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_a1f3">
                <Input
                  id="eb-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_d893" />
              </Field>
              <Field
                label="Description"
                htmlFor="eb-desc"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_0fa2">
                <textarea
                  id="eb-desc"
                  className={inputClass('min-h-20 resize-none')}
                  placeholder="Paste listing description"
                  value={listingDesc}
                  onChange={(e) => setListingDesc(e.target.value)}
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_494f" />
              </Field>
              <Field
                label="Number of Photos"
                htmlFor="eb-photos"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_2284">
                <Input
                  id="eb-photos"
                  type="number"
                  min="0"
                  max="12"
                  placeholder="0"
                  value={listingPhotos}
                  onChange={(e) => setListingPhotos(e.target.value)}
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_0b30" />
              </Field>
            </div>
            <div
              className="mt-4"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_d455">
              <Button
                onClick={handleQualityCheck}
                loading={qualityLoading}
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_c22b">
                <Eye
                  className="h-4 w-4"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_f187" />
                Check Quality
              </Button>
            </div>
          </Card>

          {qualityLoading && (
            <div
              className="flex items-center justify-center py-12"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_5510">
              <Spinner
                size="lg"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_9a80" />
            </div>
          )}

          {qualityResult && !qualityLoading && (
            <div
              className="flex flex-col gap-4"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_6ff4">
              <Card
                className="p-5"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_c33f">
                <div
                  className="flex items-center justify-between"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_b641">
                  <h4
                    className="text-lg font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_c984">Quality Score</h4>
                  <div
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-full border-4 text-xl font-bold',
                      qualityResult.score >= 80
                        ? 'border-success/30 bg-success/10 text-success'
                        : qualityResult.score >= 50
                          ? 'border-warning/30 bg-warning/10 text-warning'
                          : 'border-destructive/30 bg-destructive/10 text-destructive',
                    )}
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_aec7">
                    {qualityResult.score}
                  </div>
                </div>
              </Card>
              <div
                className="space-y-2"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_6e34">
                {qualityResult.issues.map((issue, i) => {
                  const Icon = severityIcons[issue.severity] || CheckCircle2;
                  return (
                    <div
                      key={i}
                      className={cn(
                        'flex items-start gap-3 rounded-lg border px-4 py-3 text-sm',
                        severityStyles[issue.severity],
                      )}
                      data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_0205_${i}`}>
                      <Icon
                        className="mt-0.5 h-4 w-4 shrink-0"
                        data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_7742_${i}`} />
                      <div
                        data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_9fc0_${i}`}>
                        <span
                          className="font-semibold capitalize"
                          data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_6e3d_${i}`}>{issue.field}: </span>
                        {issue.message}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      {subTab === 'comps' && (
        <div
          className="flex flex-col gap-4"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_4c4b">
          <Alert
            variant="info"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_6e75">
            Use this tool to research recently sold items similar to yours. Enter search terms that buyers would use.
          </Alert>
          <Card
            className="p-6"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_cdec">
            <h3
              className="mb-4 text-lg font-semibold text-foreground"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_7ab5">Sold Comps Analyzer</h3>
            <Field
              label="Search Terms"
              htmlFor="eb-comps-search"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_90ad">
              <Input
                id="eb-comps-search"
                placeholder="e.g., vintage Nike Air Jordan 1 Chicago"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_4891" />
            </Field>
            <div
              className="mt-4"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_27a5">
              <Button
                variant="outline"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_dfbf">
                <Search
                  className="h-4 w-4"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_bfa2" />
                Search Sold Listings
              </Button>
            </div>
          </Card>
          <EmptyState
            icon={BarChart3}
            title="Sold comps data"
            description="Enter search terms above to analyze recent sold prices and market trends on eBay."
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_8ef9" />
        </div>
      )}
      {subTab === 'fees' && (
        <div
          className="flex flex-col gap-4"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_857c">
          <Card
            className="p-6"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_a23e">
            <h3
              className="mb-4 text-lg font-semibold text-foreground"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_9f28">eBay Fee Calculator</h3>
            <div
              className="grid gap-4 sm:grid-cols-3"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_d8e1">
              <Field
                label="Sale Price ($)"
                htmlFor="eb-fee-price"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_7105">
                <Input
                  id="eb-fee-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={feeSalePrice}
                  onChange={(e) => setFeeSalePrice(e.target.value)}
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_6bf6" />
              </Field>
              <Field
                label="Category Fee Rate (%)"
                htmlFor="eb-fee-cat"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_dd04">
                <select
                  id="eb-fee-cat"
                  className={inputClass()}
                  value={feeCategory}
                  onChange={(e) => setFeeCategory(e.target.value)}
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_99d6">
                  <option
                    value="12.9"
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_a159">Most Categories (12.9%)</option>
                  <option
                    value="8.9"
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_1f13">Electronics (8.9%)</option>
                  <option
                    value="10.0"
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_2f84">Fashion (10.0%)</option>
                  <option
                    value="15.0"
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_7d60">Collectibles (15.0%)</option>
                  <option
                    value="5.0"
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_b49d">Musical Instruments (5.0%)</option>
                </select>
              </Field>
              <Field
                label="Shipping Charged ($)"
                htmlFor="eb-fee-ship"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_6eb3">
                <Input
                  id="eb-fee-ship"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={feeShipping}
                  onChange={(e) => setFeeShipping(e.target.value)}
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_3e91" />
              </Field>
            </div>
          </Card>

          {feeCalculation && (
            <Card
              className="p-5"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_ccb5">
              <h4
                className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_9d81">
                Fee Breakdown
              </h4>
              <div
                className="space-y-2 text-sm"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_a1f2">
                <div
                  className="flex justify-between border-b border-border/40 pb-2"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_0797">
                  <span
                    className="text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_294f">Final Value Fee</span>
                  <span
                    className="font-medium text-destructive"
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_40b2">-${feeCalculation.finalValueFee.toFixed(2)}</span>
                </div>
                <div
                  className="flex justify-between border-b border-border/40 pb-2"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_2fe0">
                  <span
                    className="text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_d22e">PayPal / Payment Fee</span>
                  <span
                    className="font-medium text-destructive"
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_f40d">-${feeCalculation.paypalFee.toFixed(2)}</span>
                </div>
                <div
                  className="flex justify-between border-b border-border/40 pb-2"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_c149">
                  <span
                    className="text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_ec1b">Total Fees</span>
                  <span
                    className="font-bold text-destructive"
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_9480">-${feeCalculation.totalFees.toFixed(2)}</span>
                </div>
                <div
                  className="flex justify-between pt-2"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_057b">
                  <span
                    className="font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_8d18">Net Proceeds</span>
                  <span
                    className="font-bold text-success"
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_7d91">${feeCalculation.netProceeds.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          )}

          {!feeCalculation && (
            <EmptyState
              icon={DollarSign}
              title="Enter sale details"
              description="Fill in the sale price and category to calculate eBay fees."
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_c872" />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Product SEO ────────────────────────────────────────────────────────────

interface SeoAnalysisResult {
  titleTag: { current: string; suggestion: string; length: number; score: number };
  metaDescription: { current: string; suggestion: string; length: number; score: number };
  imageAltText: { suggestions: string[]; score: number };
  schemaMarkup: { recommendations: string[]; score: number };
  internalLinking: { suggestions: string[]; score: number };
  overallScore: number;
}

function ProductSeoTab() {
  const dispatch = useAppDispatch();
  const [pageTitle, setPageTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [imageAlts, setImageAlts] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeoAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!pageTitle.trim() && !productName.trim()) {
      dispatch(addToast({ message: 'Please enter at least a page title or product name.', variant: 'error' }));
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const prompt = `Analyze this product page for SEO and provide optimization suggestions.

Page Title: ${pageTitle || '(not provided)'}
Meta Description: ${metaDesc || '(not provided)'}
Product Name: ${productName || '(not provided)'}
Product Category: ${productCategory || '(not provided)'}
Current Image Alt Texts: ${imageAlts || '(not provided)'}

Respond with valid JSON only (no markdown fences):
{
  "titleTag": { "current": "${pageTitle}", "suggestion": "<optimized title 50-60 chars>", "length": ${pageTitle.length}, "score": <0-100> },
  "metaDescription": { "current": "${metaDesc}", "suggestion": "<optimized description 150-160 chars>", "length": ${metaDesc.length}, "score": <0-100> },
  "imageAltText": { "suggestions": ["alt1", "alt2", "alt3"], "score": <0-100> },
  "schemaMarkup": { "recommendations": ["rec1", "rec2"], "score": <0-100> },
  "internalLinking": { "suggestions": ["link idea 1", "link idea 2"], "score": <0-100> },
  "overallScore": <average of all scores>
}`;
      const response = await aiService.chat(prompt, 'You are a product page SEO specialist.');
      if (response.success && response.data?.response) {
        const cleaned = response.data.response.replace(/```json\n?|```/g, '').trim();
        const parsed = JSON.parse(cleaned) as SeoAnalysisResult;
        setResult(parsed);
        dispatch(addToast({ message: 'SEO analysis complete!', variant: 'success' }));
      } else {
        dispatch(addToast({ message: 'SEO analysis failed. Please try again.', variant: 'error' }));
      }
    } catch {
      dispatch(addToast({ message: 'Failed to connect to AI service.', variant: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div
      className="flex flex-col gap-6"
      data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_75f6">
      <Card
        className="p-6"
        data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_90db">
        <h3
          className="mb-4 text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_0c3b">Product Page SEO Analyzer</h3>
        <div
          className="grid gap-4 sm:grid-cols-2"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_bcdc">
          <Field
            label="Page Title"
            htmlFor="seo-title"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_1832">
            <Input
              id="seo-title"
              placeholder="Current page title tag"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_c71a" />
          </Field>
          <Field
            label="Product Name"
            htmlFor="seo-name"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_3eda">
            <Input
              id="seo-name"
              placeholder="Product name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_96a2" />
          </Field>
          <Field
            label="Meta Description"
            htmlFor="seo-meta"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_6bdd">
            <textarea
              id="seo-meta"
              className={inputClass('min-h-20 resize-none')}
              placeholder="Current meta description"
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_f6b8" />
          </Field>
          <Field
            label="Product Category"
            htmlFor="seo-cat"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_29fc">
            <Input
              id="seo-cat"
              placeholder="e.g., Running Shoes"
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_324d" />
          </Field>
          <Field
            label="Image Alt Texts (comma-separated)"
            htmlFor="seo-alts"
            className="sm:col-span-2"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_e3b1">
            <Input
              id="seo-alts"
              placeholder="e.g., red running shoes side view, shoe sole detail"
              value={imageAlts}
              onChange={(e) => setImageAlts(e.target.value)}
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_050c" />
          </Field>
        </div>
        <div
          className="mt-4"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_5cdd">
          <Button
            onClick={handleAnalyze}
            loading={loading}
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_9fc8">
            <Globe
              className="h-4 w-4"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_57e0" />
            Analyze SEO
          </Button>
        </div>
      </Card>
      {loading && (
        <div
          className="flex items-center justify-center py-12"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_df38">
          <Spinner
            size="lg"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_74c3" />
        </div>
      )}
      {result && !loading && (
        <div
          className="flex flex-col gap-4"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_65f6">
          <Card
            className="p-5"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_6378">
            <div
              className="flex items-center justify-between"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_e50c">
              <h4
                className="text-lg font-semibold text-foreground"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_cd51">Overall SEO Score</h4>
              <div
                className={cn(
                  'flex h-16 w-16 items-center justify-center rounded-full border-4 text-2xl font-bold',
                  result.overallScore >= 80
                    ? 'border-success/30 bg-success/10 text-success'
                    : result.overallScore >= 50
                      ? 'border-warning/30 bg-warning/10 text-warning'
                      : 'border-destructive/30 bg-destructive/10 text-destructive',
                )}
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_0651">
                {result.overallScore}
              </div>
            </div>
          </Card>

          <div
            className="grid gap-4 sm:grid-cols-2"
            data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_921f">
            <Card
              className="p-5"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_9802">
              <div
                className="flex items-center justify-between"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_415a">
                <div
                  className="flex items-center gap-2 text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_5fc1">
                  <FileText
                    className="h-4 w-4"
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_568a" />
                  <span
                    className="text-xs font-semibold uppercase tracking-wide"
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_485d">Title Tag</span>
                </div>
                <span
                  className={cn('text-sm font-bold', scoreColor(result.titleTag.score))}
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_89c2">
                  {result.titleTag.score}/100
                </span>
              </div>
              {result.titleTag.current && (
                <p
                  className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground line-through"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_179d">
                  {result.titleTag.current}
                </p>
              )}
              <p
                className="mt-2 text-sm font-medium text-foreground"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_87c1">{result.titleTag.suggestion}</p>
              <p
                className="mt-1 text-xs text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_ddd9">
                Length: {result.titleTag.length} chars (target: 50-60)
              </p>
            </Card>

            <Card
              className="p-5"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_e0cf">
              <div
                className="flex items-center justify-between"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_47a0">
                <div
                  className="flex items-center gap-2 text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_9882">
                  <FileText
                    className="h-4 w-4"
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_d7fe" />
                  <span
                    className="text-xs font-semibold uppercase tracking-wide"
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_1f3b">Meta Description</span>
                </div>
                <span
                  className={cn('text-sm font-bold', scoreColor(result.metaDescription.score))}
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_364f">
                  {result.metaDescription.score}/100
                </span>
              </div>
              {result.metaDescription.current && (
                <p
                  className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground line-through"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_7e81">
                  {result.metaDescription.current}
                </p>
              )}
              <p
                className="mt-2 text-sm font-medium text-foreground"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_312a">{result.metaDescription.suggestion}</p>
              <p
                className="mt-1 text-xs text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_8db9">
                Length: {result.metaDescription.length} chars (target: 150-160)
              </p>
            </Card>

            <Card
              className="p-5"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_caad">
              <div
                className="flex items-center justify-between"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_aeac">
                <div
                  className="flex items-center gap-2 text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_d0d2">
                  <ImageIcon
                    className="h-4 w-4"
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_0642" />
                  <span
                    className="text-xs font-semibold uppercase tracking-wide"
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_0f1c">Image Alt Text</span>
                </div>
                <span
                  className={cn('text-sm font-bold', scoreColor(result.imageAltText.score))}
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_a2ee">
                  {result.imageAltText.score}/100
                </span>
              </div>
              <ul
                className="mt-3 space-y-2"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_80f7">
                {result.imageAltText.suggestions.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-foreground"
                    data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_90cb_${i}`}>
                    <ArrowRight
                      className="mt-0.5 h-3 w-3 shrink-0 text-primary"
                      data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_f99b_${i}`} />
                    {s}
                  </li>
                ))}
              </ul>
            </Card>

            <Card
              className="p-5"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_8b69">
              <div
                className="flex items-center justify-between"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_3dc6">
                <div
                  className="flex items-center gap-2 text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_8c7a">
                  <Package
                    className="h-4 w-4"
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_8421" />
                  <span
                    className="text-xs font-semibold uppercase tracking-wide"
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_d831">Schema Markup</span>
                </div>
                <span
                  className={cn('text-sm font-bold', scoreColor(result.schemaMarkup.score))}
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_51ba">
                  {result.schemaMarkup.score}/100
                </span>
              </div>
              <ul
                className="mt-3 space-y-2"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_1d6b">
                {result.schemaMarkup.recommendations.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-foreground"
                    data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_ef43_${i}`}>
                    <ArrowRight
                      className="mt-0.5 h-3 w-3 shrink-0 text-primary"
                      data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_743c_${i}`} />
                    {r}
                  </li>
                ))}
              </ul>
            </Card>

            <Card
              className="p-5 sm:col-span-2"
              data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_2981">
              <div
                className="flex items-center justify-between"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_487b">
                <div
                  className="flex items-center gap-2 text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_6cdb">
                  <Link2
                    className="h-4 w-4"
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_654e" />
                  <span
                    className="text-xs font-semibold uppercase tracking-wide"
                    data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_2f78">Internal Linking</span>
                </div>
                <span
                  className={cn('text-sm font-bold', scoreColor(result.internalLinking.score))}
                  data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_c2c2">
                  {result.internalLinking.score}/100
                </span>
              </div>
              <ul
                className="mt-3 space-y-2"
                data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_121c">
                {result.internalLinking.suggestions.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-foreground"
                    data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_c3e3_${i}`}>
                    <ArrowRight
                      className="mt-0.5 h-3 w-3 shrink-0 text-primary"
                      data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_4ab0_${i}`} />
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
      {!result && !loading && (
        <EmptyState
          icon={Globe}
          title="No SEO analysis yet"
          description="Enter your product page details above to get AI-powered SEO recommendations."
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_338b" />
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function DashboardEcommerceIntel() {
  const [activeTab, setActiveTab] = useState<TabId>('product-research');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'product-research':
        return <ProductResearchTab data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_a681" />;
      case 'listing-optimization':
        return <ListingOptimizationTab data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_5eaf" />;
      case 'profit-calculator':
        return <ProfitCalculatorTab data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_21c9" />;
      case 'shopify-tools':
        return <ShopifyToolsTab data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_63bd" />;
      case 'ebay-tools':
        return <EbayToolsTab data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_45c5" />;
      case 'product-seo':
        return <ProductSeoTab data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_3082" />;
      default:
        return null;
    }
  };

  return (
    <div
      className="flex flex-col gap-6"
      data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_b875">
      <div data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_740d">
        <h1
          className="font-heading text-2xl font-bold text-foreground sm:text-3xl tracking-tight"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_9741">
          E-Commerce Intelligence
        </h1>
        <p
          className="mt-2 text-sm text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_9cdf">
          AI-powered tools for product research, listing optimization, profit analysis, and marketplace-specific insights.
        </p>
      </div>
      <div
        className="flex gap-2 overflow-x-auto border-b border-border pb-px"
        data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_5651">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
              )}
              data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_2937_${tab.id}`}>
              <Icon
                className="h-4 w-4"
                data-icod-id={`src_pages_dashboard_dashboardecommerceintel_tsx_d435_${tab.id}`} />
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        className="min-h-[400px]"
        data-icod-id="src_pages_dashboard_dashboardecommerceintel_tsx_da92">{renderTabContent()}</div>
    </div>
  );
}
