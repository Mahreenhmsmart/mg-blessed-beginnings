import { useState, useEffect } from 'react';
import { Button, Card, Spinner, Alert, Badge } from '@/components/ui';
import { cn } from '@/utils/cn';
import SEOHead from '@/components/SEOHead';
import AdSenseSlot from '@/components/AdSenseSlot';
import {
  Zap, RefreshCw, Send, CheckCircle2, XCircle, AlertTriangle,
  ShieldCheck, Infinity as InfinityIcon, CreditCard, UserX, Play,
} from 'lucide-react';
import { getFreeProviders, freeGenerate } from '@/services/aiService';
import type { FreeProviderStatus } from '@/services/aiService';

const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google Gemini',
  openrouter: 'OpenRouter',
};

function getStatusColor(status: FreeProviderStatus['status']): string {
  switch (status) {
    case 'Working':
      return 'text-success';
    case 'Failed':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
}

function getStatusIcon(status: FreeProviderStatus['status']) {
  switch (status) {
    case 'Working':
      return (
        <CheckCircle2
          className="h-4 w-4 text-success"
          data-icod-id="src_pages_freeaitokenshub_tsx_9723" />
      );
    case 'Failed':
      return (
        <XCircle
          className="h-4 w-4 text-destructive"
          data-icod-id="src_pages_freeaitokenshub_tsx_2fc2" />
      );
    default:
      return (
        <AlertTriangle
          className="h-4 w-4 text-muted-foreground"
          data-icod-id="src_pages_freeaitokenshub_tsx_5120" />
      );
  }
}

export default function FreeAITokensHub() {
  const [providers, setProviders] = useState<FreeProviderStatus[]>([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [answeredBy, setAnsweredBy] = useState<{ provider: string; model: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allBusy, setAllBusy] = useState(false);

  // Fetch provider statuses on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getFreeProviders();
        if (!cancelled) setProviders(data);
      } catch {
        // Silently handle — panel will show "Not configured" state
      } finally {
        if (!cancelled) setProvidersLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setAnsweredBy(null);
    setAllBusy(false);

    try {
      const data = await freeGenerate(prompt.trim());
      setResult(data.response);
      setAnsweredBy({ provider: data.provider, model: data.model });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; allProvidersBusy?: boolean } }; message?: string };
      if (axiosErr.response?.data?.allProvidersBusy) {
        setAllBusy(true);
        setError(axiosErr.response.data.error || 'All free providers are busy right now — please try again in a little while');
      } else if (axiosErr.response?.data?.error) {
        setError(axiosErr.response.data.error);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshProviders = async () => {
    setProvidersLoading(true);
    try {
      const data = await getFreeProviders();
      setProviders(data);
    } catch {
      // Keep existing data
    } finally {
      setProvidersLoading(false);
    }
  };

  const workingCount = providers.filter((p) => p.status === 'Working').length;

  return (
    <>
      <SEOHead
        title="Free AI Tokens Hub — Run AI Prompts for Free | MG Blessed Beginnings"
        description="Run one AI prompt through the site's free providers with automatic failover — no key, no sign-up, free forever. Powered by Google Gemini and OpenRouter."
        keywords="free AI tokens, free AI API, free AI prompt, AI failover, free GPT alternative, free Gemini, free AI generation"
        canonicalUrl="/ai-tools/free-ai-tokens-hub"
        data-icod-id="src_pages_freeaitokenshub_tsx_72ba" />
      {/* Hero */}
      <section
        className="py-20"
        style={{ background: 'var(--section-lavender)' }}
        data-icod-id="src_pages_freeaitokenshub_tsx_9c4b">
        <div
          className="container mx-auto px-4 text-center"
          data-icod-id="src_pages_freeaitokenshub_tsx_b9ff">
          <div
            className="inline-flex items-center gap-2 mb-6"
            data-icod-id="src_pages_freeaitokenshub_tsx_638a">
            <Badge
              variant="free"
              className="text-base md:text-lg px-5 py-2 shadow-[0_4px_16px_rgba(0,212,245,0.5)]"
              data-icod-id="src_pages_freeaitokenshub_tsx_abcb">
              <InfinityIcon
                className="h-4 w-4 mr-1"
                data-icod-id="src_pages_freeaitokenshub_tsx_3aa1" />
              Free Forever
            </Badge>
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight"
            data-icod-id="src_pages_freeaitokenshub_tsx_e063">
            Free AI Tokens Hub
          </h1>
          <p
            className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            data-icod-id="src_pages_freeaitokenshub_tsx_3913">
            Run one AI prompt through the site's free providers with automatic failover — no key, no sign-up, free forever.
          </p>
        </div>
      </section>
      {/* Ad Banner after Hero */}
      <div
        className="container mx-auto px-4 py-6"
        data-icod-id="src_pages_freeaitokenshub_tsx_7f7b">
        <AdSenseSlot format="banner" data-icod-id="src_pages_freeaitokenshub_tsx_94f8" />
      </div>
      {/* Main content */}
      <section
        className="py-16 bg-background"
        data-icod-id="src_pages_freeaitokenshub_tsx_9f9b">
        <div
          className="container mx-auto px-4 max-w-7xl"
          data-icod-id="src_pages_freeaitokenshub_tsx_e053">
          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            data-icod-id="src_pages_freeaitokenshub_tsx_01d1">
            {/* Left column — Prompt & Result */}
            <div
              className="lg:col-span-2 space-y-6"
              data-icod-id="src_pages_freeaitokenshub_tsx_33c3">
              {/* Provider Status Panel */}
              <Card className="p-5" data-icod-id="src_pages_freeaitokenshub_tsx_686a">
                <div
                  className="flex items-center justify-between mb-4"
                  data-icod-id="src_pages_freeaitokenshub_tsx_690c">
                  <h2
                    className="text-lg font-bold text-foreground flex items-center gap-2"
                    data-icod-id="src_pages_freeaitokenshub_tsx_d7d7">
                    <ShieldCheck
                      className="h-5 w-5 text-primary"
                      data-icod-id="src_pages_freeaitokenshub_tsx_ce20" />
                    Live Provider Status
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefreshProviders}
                    disabled={providersLoading}
                    aria-label="Refresh provider status"
                    data-icod-id="src_pages_freeaitokenshub_tsx_fc91">
                    <RefreshCw
                      className={cn('h-4 w-4', providersLoading && 'animate-spin')}
                      data-icod-id="src_pages_freeaitokenshub_tsx_8649" />
                  </Button>
                </div>

                {providersLoading ? (
                  <div
                    className="flex items-center justify-center py-6"
                    data-icod-id="src_pages_freeaitokenshub_tsx_ac67">
                    <Spinner size="sm" data-icod-id="src_pages_freeaitokenshub_tsx_054d" />
                  </div>
                ) : providers.length === 0 ? (
                  <p
                    className="text-sm text-muted-foreground text-center py-4"
                    data-icod-id="src_pages_freeaitokenshub_tsx_3b53">
                    No free providers configured. Contact admin to enable free-tier AI access.
                  </p>
                ) : (
                  <div className="space-y-2" data-icod-id="src_pages_freeaitokenshub_tsx_aba8">
                    {providers.map((provider) => (
                      <div
                        key={provider.provider}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50"
                        data-icod-id={`src_pages_freeaitokenshub_tsx_c4d1_${provider.provider}`}>
                        <div
                          className="flex items-center gap-3"
                          data-icod-id={`src_pages_freeaitokenshub_tsx_7008_${provider.provider}`}>
                          {getStatusIcon(provider.status)}
                          <div data-icod-id={`src_pages_freeaitokenshub_tsx_abc3_${provider.provider}`}>
                            <span
                              className="font-semibold text-foreground text-sm"
                              data-icod-id={`src_pages_freeaitokenshub_tsx_a827_${provider.provider}`}>
                              {PROVIDER_LABELS[provider.provider] || provider.provider}
                            </span>
                            <span
                              className="text-xs text-muted-foreground ml-2"
                              data-icod-id={`src_pages_freeaitokenshub_tsx_f5de_${provider.provider}`}>
                              {provider.modelName}
                            </span>
                          </div>
                        </div>
                        <span
                          className={cn('text-xs font-bold uppercase tracking-wide', getStatusColor(provider.status))}
                          data-icod-id={`src_pages_freeaitokenshub_tsx_929a_${provider.provider}`}>
                          {provider.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {!providersLoading && workingCount > 0 && (
                  <p
                    className="text-xs text-muted-foreground mt-3 text-center"
                    data-icod-id="src_pages_freeaitokenshub_tsx_7380">
                    {workingCount} provider{workingCount !== 1 ? 's' : ''} ready &middot; Automatic failover enabled
                  </p>
                )}
              </Card>

              {/* Prompt Input */}
              <Card
                className="p-6 space-y-4"
                data-icod-id="src_pages_freeaitokenshub_tsx_51fa">
                <label
                  htmlFor="prompt-input"
                  className="block text-sm font-bold text-foreground"
                  data-icod-id="src_pages_freeaitokenshub_tsx_1d49">
                  Your Prompt
                </label>
                <textarea
                  id="prompt-input"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask anything — e.g., 'Write a product description for handmade leather wallets'"
                  className="w-full min-h-[140px] resize-y rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all text-sm leading-relaxed"
                  maxLength={4000}
                  disabled={loading}
                  data-icod-id="src_pages_freeaitokenshub_tsx_b6e4" />
                <div
                  className="flex items-center justify-between"
                  data-icod-id="src_pages_freeaitokenshub_tsx_7506">
                  <span
                    className="text-xs text-muted-foreground"
                    data-icod-id="src_pages_freeaitokenshub_tsx_1457">
                    {prompt.length}/4000 characters
                  </span>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSubmit}
                    disabled={!prompt.trim() || loading}
                    loading={loading}
                    data-icod-id="src_pages_freeaitokenshub_tsx_9133">
                    <Send
                      className="h-4 w-4 mr-2"
                      data-icod-id="src_pages_freeaitokenshub_tsx_13a4" />
                    {loading ? 'Generating...' : 'Generate'}
                  </Button>
                </div>
              </Card>

              {/* Error / All Busy */}
              {allBusy && (
                <Alert variant="warning" data-icod-id="src_pages_freeaitokenshub_tsx_8af6">
                  <div
                    className="flex items-start gap-3"
                    data-icod-id="src_pages_freeaitokenshub_tsx_7516">
                    <AlertTriangle
                      className="h-5 w-5 mt-0.5 shrink-0"
                      data-icod-id="src_pages_freeaitokenshub_tsx_7b6c" />
                    <div data-icod-id="src_pages_freeaitokenshub_tsx_9d63">
                      <p className="font-bold" data-icod-id="src_pages_freeaitokenshub_tsx_d74e">All free providers are busy right now</p>
                      <p
                        className="text-sm mt-1"
                        data-icod-id="src_pages_freeaitokenshub_tsx_cd65">
                        All free providers are busy right now — please try again in a little while.
                        Free quotas reset automatically based on each provider's schedule.
                      </p>
                    </div>
                  </div>
                </Alert>
              )}

              {error && !allBusy && (
                <Alert variant="error" data-icod-id="src_pages_freeaitokenshub_tsx_eb95">
                  <p data-icod-id="src_pages_freeaitokenshub_tsx_f9d5">{error}</p>
                </Alert>
              )}

              {/* Result */}
              {result && (
                <Card
                  className="p-6 space-y-4"
                  data-icod-id="src_pages_freeaitokenshub_tsx_9d03">
                  <div
                    className="flex items-center justify-between"
                    data-icod-id="src_pages_freeaitokenshub_tsx_24dc">
                    <h3
                      className="text-lg font-bold text-foreground flex items-center gap-2"
                      data-icod-id="src_pages_freeaitokenshub_tsx_e40f">
                      <Zap
                        className="h-5 w-5 text-primary"
                        data-icod-id="src_pages_freeaitokenshub_tsx_59ea" />
                      AI Response
                    </h3>
                    {answeredBy && (
                      <Badge
                        variant="free"
                        className="text-xs"
                        data-icod-id="src_pages_freeaitokenshub_tsx_a3f4">
                        {PROVIDER_LABELS[answeredBy.provider] || answeredBy.provider} &middot; {answeredBy.model}
                      </Badge>
                    )}
                  </div>
                  <div
                    className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap leading-relaxed"
                    data-icod-id="src_pages_freeaitokenshub_tsx_cff0">
                    {result}
                  </div>
                </Card>
              )}
            </div>

            {/* Right column — How it works + Demo slot */}
            <div className="space-y-6" data-icod-id="src_pages_freeaitokenshub_tsx_5567">
              {/* How It Works */}
              <Card
                className="p-6 space-y-4"
                data-icod-id="src_pages_freeaitokenshub_tsx_ace0">
                <h2
                  className="text-lg font-bold text-foreground"
                  data-icod-id="src_pages_freeaitokenshub_tsx_aef1">How It Works</h2>
                <ul
                  className="space-y-3 text-sm text-muted-foreground"
                  data-icod-id="src_pages_freeaitokenshub_tsx_10da">
                  <li
                    className="flex items-start gap-2"
                    data-icod-id="src_pages_freeaitokenshub_tsx_479b">
                    <CheckCircle2
                      className="h-4 w-4 text-primary mt-0.5 shrink-0"
                      data-icod-id="src_pages_freeaitokenshub_tsx_5b24" />
                    <span data-icod-id="src_pages_freeaitokenshub_tsx_1cc7">The hub pools the site's configured free AI providers into one unified gateway.</span>
                  </li>
                  <li
                    className="flex items-start gap-2"
                    data-icod-id="src_pages_freeaitokenshub_tsx_2640">
                    <CheckCircle2
                      className="h-4 w-4 text-primary mt-0.5 shrink-0"
                      data-icod-id="src_pages_freeaitokenshub_tsx_e370" />
                    <span data-icod-id="src_pages_freeaitokenshub_tsx_1c38">When one provider runs out of free quota or hits a rate limit, the system switches automatically to the next working provider.</span>
                  </li>
                  <li
                    className="flex items-start gap-2"
                    data-icod-id="src_pages_freeaitokenshub_tsx_c37f">
                    <CheckCircle2
                      className="h-4 w-4 text-primary mt-0.5 shrink-0"
                      data-icod-id="src_pages_freeaitokenshub_tsx_4e45" />
                    <span data-icod-id="src_pages_freeaitokenshub_tsx_f515">Free quotas reset on each provider's own schedule — Google resets daily, OpenRouter resets periodically.</span>
                  </li>
                  <li
                    className="flex items-start gap-2"
                    data-icod-id="src_pages_freeaitokenshub_tsx_a205">
                    <CheckCircle2
                      className="h-4 w-4 text-primary mt-0.5 shrink-0"
                      data-icod-id="src_pages_freeaitokenshub_tsx_999f" />
                    <span data-icod-id="src_pages_freeaitokenshub_tsx_aff5">No credit card required. No sign-up needed. Free forever.</span>
                  </li>
                </ul>
              </Card>

              {/* Feature badges */}
              <Card
                className="p-6 space-y-3"
                data-icod-id="src_pages_freeaitokenshub_tsx_8e9e">
                <div
                  className="flex items-center gap-3 text-sm text-foreground"
                  data-icod-id="src_pages_freeaitokenshub_tsx_940b">
                  <CreditCard
                    className="h-5 w-5 text-muted-foreground"
                    data-icod-id="src_pages_freeaitokenshub_tsx_d00e" />
                  <span data-icod-id="src_pages_freeaitokenshub_tsx_83a1">No credit card needed</span>
                </div>
                <div
                  className="flex items-center gap-3 text-sm text-foreground"
                  data-icod-id="src_pages_freeaitokenshub_tsx_294a">
                  <UserX
                    className="h-5 w-5 text-muted-foreground"
                    data-icod-id="src_pages_freeaitokenshub_tsx_ea28" />
                  <span data-icod-id="src_pages_freeaitokenshub_tsx_ada4">No sign-up required</span>
                </div>
                <div
                  className="flex items-center gap-3 text-sm text-foreground"
                  data-icod-id="src_pages_freeaitokenshub_tsx_f9f1">
                  <InfinityIcon
                    className="h-5 w-5 text-muted-foreground"
                    data-icod-id="src_pages_freeaitokenshub_tsx_1bae" />
                  <span data-icod-id="src_pages_freeaitokenshub_tsx_99c9">Free forever</span>
                </div>
                <div
                  className="flex items-center gap-3 text-sm text-foreground"
                  data-icod-id="src_pages_freeaitokenshub_tsx_e41f">
                  <RefreshCw
                    className="h-5 w-5 text-muted-foreground"
                    data-icod-id="src_pages_freeaitokenshub_tsx_22d9" />
                  <span data-icod-id="src_pages_freeaitokenshub_tsx_5878">Auto-failover between providers</span>
                </div>
              </Card>

              {/* See It In Action — demo video placeholder */}
              <Card className="p-6" data-icod-id="src_pages_freeaitokenshub_tsx_2e6b">
                <h2
                  className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"
                  data-icod-id="src_pages_freeaitokenshub_tsx_823a">
                  <Play
                    className="h-5 w-5 text-primary"
                    data-icod-id="src_pages_freeaitokenshub_tsx_8722" />
                  See It In Action
                </h2>
                <div
                  className="aspect-video rounded-xl bg-muted flex items-center justify-center border border-border"
                  data-icod-id="src_pages_freeaitokenshub_tsx_8c2a">
                  <div
                    className="text-center space-y-2"
                    data-icod-id="src_pages_freeaitokenshub_tsx_99c4">
                    <Play
                      className="h-12 w-12 text-muted-foreground/40 mx-auto"
                      data-icod-id="src_pages_freeaitokenshub_tsx_8009" />
                    <p
                      className="text-sm text-muted-foreground"
                      data-icod-id="src_pages_freeaitokenshub_tsx_9769">Demo video coming soon</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
