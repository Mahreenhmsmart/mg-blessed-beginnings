import { useState, useEffect } from 'react';
import { Send, Sparkles, RotateCcw, Eye, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { sendAIPrompt, clearAIResponse } from '@/store/slices/aiSlice';
import {
  fetchVisibilityHistory,
  fetchVisibilitySummary,
  triggerVisibilityCheckThunk,
} from '@/store/slices/analysisSlice';
import { Button, Alert, Spinner, Field, Badge } from '@/components/ui';
import { inputClass } from '@/components/ui/Input';
import DashboardCard from '@/components/dashboard/DashboardCard';
import EmptyStatePanel from '@/components/dashboard/EmptyStatePanel';

const PLATFORM_COLORS: Record<string, string> = {
  ChatGPT: 'var(--color-teal)',
  Perplexity: 'var(--color-purple)',
  Gemini: 'var(--color-pink)',
  'Google-SGE': 'var(--color-gold)',
};

export default function DashboardAIVisibility() {
  const dispatch = useAppDispatch();
  const { response, status, error } = useAppSelector((s) => s.ai);
  const { currentProjectId } = useAppSelector((s) => s.projects);
  const { aiVisibilityHistory, aiVisibilitySummary, visibilityStatus, visibilityMutateStatus } = useAppSelector((s) => s.analysis);

  const [prompt, setPrompt] = useState('');
  const [system, setSystem] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      setPrompt('');
    }
  }, [status]);

  useEffect(() => {
    if (currentProjectId) {
      dispatch(fetchVisibilitySummary(currentProjectId));
      dispatch(fetchVisibilityHistory(currentProjectId));
    }
  }, [currentProjectId, dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    dispatch(sendAIPrompt({ prompt: prompt.trim(), system: system.trim() || undefined }));
  };

  const handleClear = () => {
    dispatch(clearAIResponse());
    setPrompt('');
    setSystem('');
  };

  const handleVisibilityCheck = () => {
    if (!currentProjectId) return;
    dispatch(triggerVisibilityCheckThunk(currentProjectId))
      .then(() => {
        dispatch(addToast({ message: 'AI visibility check started!', variant: 'success' }));
        setTimeout(() => {
          dispatch(fetchVisibilitySummary(currentProjectId));
          dispatch(fetchVisibilityHistory(currentProjectId));
        }, 15000);
      })
      .catch(() => {
        dispatch(addToast({ message: 'Failed to start visibility check.', variant: 'error' }));
      });
  };

  const isChecking = visibilityStatus === 'loading' || visibilityMutateStatus === 'loading';

  return (
    <div
      className="flex flex-col gap-6"
      data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_a7f3">
      {/* Header */}
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_0a2d">
        <div
          className="flex items-center gap-3"
          data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_9d31">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"
            data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_b923">
            <Eye
              className="h-5 w-5 text-primary"
              data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_0af7" />
          </div>
          <div data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_124b">
            <h1
              className="font-heading text-2xl font-bold text-foreground sm:text-3xl"
              data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_4a0d">
              AI Visibility
            </h1>
            <p
              className="text-sm text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_df2c">
              Track and improve your visibility across AI platforms
            </p>
          </div>
        </div>
        {currentProjectId && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleVisibilityCheck}
            loading={isChecking}
            data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_f7ab">
            <RefreshCw
              className="h-3 w-3"
              data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_c404" />
            Run Visibility Check
          </Button>
        )}
      </div>
      {/* Platform Visibility Summary */}
      <DashboardCard
        heading="AI Platform Visibility"
        data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_f971">
        <Alert
          variant="info"
          data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_6bb1">
          Visibility checks query the configured AI provider about brand mentions. Results are heuristic estimates based on AI model responses — not direct platform API data.
        </Alert>

        {isChecking ? (
          <div
            className="flex justify-center py-12"
            data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_4f8f">
            <Spinner
              size="lg"
              data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_3d6e" />
          </div>
        ) : aiVisibilitySummary.length > 0 ? (
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4"
            data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_a748">
            {aiVisibilitySummary.map((record) => (
              <div
                key={record.platform}
                className="flex flex-col gap-2 rounded-xl border border-border/40 p-4"
                data-icod-id={`src_pages_dashboard_dashboardaivisibility_tsx_974a_${record.platform}`}>
                <div
                  className="flex items-center justify-between"
                  data-icod-id={`src_pages_dashboard_dashboardaivisibility_tsx_78d9_${record.platform}`}>
                  <span
                    className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    data-icod-id={`src_pages_dashboard_dashboardaivisibility_tsx_1026_${record.platform}`}>
                    {record.platform}
                  </span>
                  {record.brandMentioned ? (
                    <CheckCircle
                      className="h-4 w-4 text-success"
                      data-icod-id={`src_pages_dashboard_dashboardaivisibility_tsx_74af_${record.platform}`} />
                  ) : (
                    <XCircle
                      className="h-4 w-4 text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardaivisibility_tsx_bd04_${record.platform}`} />
                  )}
                </div>
                <span
                  className="text-2xl font-bold"
                  style={{ color: PLATFORM_COLORS[record.platform] || 'var(--color-primary)' }}
                  data-icod-id={`src_pages_dashboard_dashboardaivisibility_tsx_ef37_${record.platform}`}>
                  {record.brandMentioned ? 'Mentioned' : 'Not Found'}
                </span>
                <div
                  className="flex items-center gap-2"
                  data-icod-id={`src_pages_dashboard_dashboardaivisibility_tsx_eabc_${record.platform}`}>
                  <span
                    className="text-[10px] text-muted-foreground"
                    data-icod-id={`src_pages_dashboard_dashboardaivisibility_tsx_3878_${record.platform}`}>
                    Confidence: {record.confidence}%
                  </span>
                  <div
                    className="h-1 flex-1 rounded-full bg-muted"
                    data-icod-id={`src_pages_dashboard_dashboardaivisibility_tsx_dd0a_${record.platform}`}>
                    <div
                      className="h-1 rounded-full"
                      style={{
                        width: `${record.confidence}%`,
                        backgroundColor: PLATFORM_COLORS[record.platform] || 'var(--color-primary)',
                      }}
                      data-icod-id={`src_pages_dashboard_dashboardaivisibility_tsx_1150_${record.platform}`} />
                  </div>
                </div>
                {record.mentionContext && (
                  <p
                    className="mt-1 text-[10px] text-muted-foreground line-clamp-2"
                    data-icod-id={`src_pages_dashboard_dashboardaivisibility_tsx_2680_${record.platform}`}>
                    {record.mentionContext}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyStatePanel
            icon={Eye}
            title="No visibility data yet"
            description="Run a visibility check to see if AI platforms mention your brand."
            className="py-10"
            data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_a32f" />
        )}
      </DashboardCard>
      {/* Visibility History Table */}
      {aiVisibilityHistory.length > 0 && (
        <DashboardCard
          heading="Visibility History"
          data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_abaa">
          <div
            className="overflow-x-auto rounded-lg border border-border/50"
            data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_4fb0">
            <table
              className="w-full text-left text-sm"
              data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_f87a">
              <thead
                className="bg-muted/50"
                data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_be2d">
                <tr
                  className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_4c78">
                  <th
                    className="px-4 py-3"
                    data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_35ef">Date</th>
                  <th
                    className="px-4 py-3"
                    data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_cb5b">Platform</th>
                  <th
                    className="px-4 py-3"
                    data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_2bcb">Mentioned</th>
                  <th
                    className="px-4 py-3"
                    data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_a87e">Confidence</th>
                  <th
                    className="px-4 py-3"
                    data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_eca4">Context</th>
                </tr>
              </thead>
              <tbody data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_11dd">
                {aiVisibilityHistory.slice(0, 20).map((record) => (
                  <tr
                    key={record._id}
                    className="border-b border-border/30 hover:bg-muted/30"
                    data-icod-id={`src_pages_dashboard_dashboardaivisibility_tsx_456d_${record._id}`}>
                    <td
                      className="px-4 py-3 text-muted-foreground text-xs"
                      data-icod-id={`src_pages_dashboard_dashboardaivisibility_tsx_9d2d_${record._id}`}>
                      {new Date(record.checkedAt).toLocaleDateString()}
                    </td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_dashboardaivisibility_tsx_c3f9_${record._id}`}>
                      <Badge
                        variant="default"
                        className="text-[9px]"
                        data-icod-id={`src_pages_dashboard_dashboardaivisibility_tsx_25f1_${record._id}`}>{record.platform}</Badge>
                    </td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_dashboardaivisibility_tsx_16d7_${record._id}`}>
                      {record.brandMentioned ? (
                        <span
                          className="text-success text-xs font-medium"
                          data-icod-id={`src_pages_dashboard_dashboardaivisibility_tsx_9def_${record._id}`}>Yes</span>
                      ) : (
                        <span
                          className="text-muted-foreground text-xs"
                          data-icod-id={`src_pages_dashboard_dashboardaivisibility_tsx_193c_${record._id}`}>No</span>
                      )}
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
                      data-icod-id={`src_pages_dashboard_dashboardaivisibility_tsx_f046_${record._id}`}>{record.confidence}%</td>
                    <td
                      className="px-4 py-3 text-xs text-muted-foreground truncate max-w-[300px]"
                      data-icod-id={`src_pages_dashboard_dashboardaivisibility_tsx_7ef9_${record._id}`}>
                      {record.mentionContext}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      )}
      {/* AI Assistant Chat */}
      <DashboardCard
        heading="AI Assistant"
        data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_b444">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_7c9e">
          <Field
            label="Your Message"
            htmlFor="ai-prompt"
            required
            data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_64ae">
            <textarea
              id="ai-prompt"
              className={inputClass('min-h-[120px] resize-y')}
              placeholder="Ask about your website's AI visibility... e.g., How can I improve my chances of being cited by ChatGPT?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              maxLength={4000}
              disabled={status === 'loading'}
              data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_f34c" />
          </Field>

          <Field
            label="System Instructions (Optional)"
            htmlFor="ai-system"
            hint="Guide the AI's tone or expertise area"
            data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_eb43">
            <textarea
              id="ai-system"
              className={inputClass('min-h-[60px] resize-y')}
              placeholder="e.g., You are an expert in AI search optimization..."
              value={system}
              onChange={(e) => setSystem(e.target.value)}
              maxLength={2000}
              disabled={status === 'loading'}
              data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_a0fc" />
          </Field>

          <div
            className="flex items-center gap-3 pt-2"
            data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_475d">
            <Button
              type="submit"
              loading={status === 'loading'}
              disabled={!prompt.trim()}
              data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_6e8b">
              <Send
                className="mr-2 h-4 w-4"
                data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_8447" />
              Send
            </Button>
            {(response || error) && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_689c">
                <RotateCcw
                  className="mr-2 h-4 w-4"
                  data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_1211" />
                Clear
              </Button>
            )}
            <span
              className="ml-auto text-xs text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_5a4b">{prompt.length}/4000</span>
          </div>
        </form>
      </DashboardCard>
      {/* Loading State */}
      {status === 'loading' && (
        <DashboardCard
          heading="Generating Response..."
          data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_4031">
          <div
            className="flex flex-col items-center justify-center gap-4 py-12"
            data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_25c4">
            <Spinner
              size="lg"
              data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_fb6a" />
            <div
              className="flex items-center gap-2 text-sm text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_347e">
              <Sparkles
                className="h-4 w-4 animate-pulse"
                data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_0416" />
              <span data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_2d4a">AI is thinking...</span>
            </div>
          </div>
        </DashboardCard>
      )}
      {/* Error State */}
      {status === 'failed' && error && (
        <Alert
          variant="error"
          data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_3d1c">
          <strong data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_751f">Error:</strong> {error}
        </Alert>
      )}
      {/* Response */}
      {status === 'succeeded' && response && (
        <DashboardCard
          heading="AI Response"
          data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_7d26">
          <div
            className="prose prose-sm max-w-none text-foreground"
            data-icod-id="src_pages_dashboard_dashboardaivisibility_tsx_68d7">
            {response.split('\n').map((line, i) => (
              <p
                key={i}
                className={line.trim() ? '' : 'h-3'}
                data-icod-id={`src_pages_dashboard_dashboardaivisibility_tsx_e276_${i}`}>{line}</p>
            ))}
          </div>
        </DashboardCard>
      )}
    </div>
  );
}
