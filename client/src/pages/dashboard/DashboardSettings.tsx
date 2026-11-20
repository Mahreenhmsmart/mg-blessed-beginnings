import { useEffect, useState, useCallback, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Settings,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Key,
  Star,
  User,
  Upload,
  Award,
  Activity,
  RefreshCw,
  Circle,
  Stethoscope,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { Button, Input, Field, Modal, Alert, Tooltip, Card, Skeleton } from '@/components/ui';
import { inputClass } from '@/components/ui/Input';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchProviderStatuses,
  saveProviderConfig,
  deleteProviderConfig,
  testProviderConnection,
  setPrimaryProvider,
  clearSaveStatus,
  resetTestStatus,
} from '@/store/slices/aiSettingsSlice';
import { addToast } from '@/store/slices/uiSlice';
import type { SaveProviderData, ProviderStatus } from '@/services/aiService';
import { runDiagnostic, getLatestDiagnosticResults, type DiagnosticResponse, type DiagnosticResult, type ProviderDiagnosticEntry } from '@/services/aiService';
import { cn } from '@/utils/cn';

// ─── Default avatar image URL ─────────────────────────────────────────────────
const DEFAULT_AVATAR_URL = '/assets/1792968956320_AI_Professional_in_a_Modern_Workspace-upload.webp';

// ─── Profile Avatar Component ─────────────────────────────────────────────────

interface ProfileAvatarProps {
  imageUrl: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

function ProfileAvatar({ imageUrl, onUpload, onRemove }: ProfileAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4 py-6" data-icod-id="profile_avatar_container">
      {/* Avatar container with relative positioning for badge */}
      <div className="relative" data-icod-id="profile_avatar_wrapper">
        {/* Main avatar circle */}
        <div
          className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-foreground"
          style={{
            background: imageUrl ? undefined : 'var(--gradient-primary)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          }}
          data-icod-id="profile_avatar_circle"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="User profile photo"
              className="h-full w-full object-cover object-top"
              loading="lazy"
              decoding="async"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              data-icod-id="profile_avatar_image"
            />
          ) : (
            <User className="h-14 w-14 text-primary-foreground" data-icod-id="profile_avatar_icon" />
          )}
        </div>

        {/* Badge overlay — positioned at bottom-right (4-5 o'clock position) */}
        <div
          className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-foreground"
          style={{ backgroundColor: 'rgb(var(--success))' }}
          data-icod-id="profile_avatar_badge"
        >
          <Award className="h-5 w-5 text-primary-foreground" data-icod-id="profile_avatar_badge_icon" />
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        data-icod-id="profile_avatar_file_input"
      />

      {/* Action buttons */}
      <div className="flex items-center gap-3" data-icod-id="profile_avatar_actions">
        <button
          type="button"
          onClick={handleUploadClick}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          style={{ backgroundColor: 'rgb(var(--card))', color: 'rgb(var(--foreground))' }}
          data-icod-id="profile_avatar_upload_btn"
        >
          <Upload className="h-4 w-4" data-icod-id="profile_avatar_upload_icon" />
          Upload Photo
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:underline"
          data-icod-id="profile_avatar_remove_btn"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

// ─── Model options per provider ────────────────────────────────────────────────

const PROVIDER_MODELS: Record<string, string[]> = {
  anthropic: ['claude-sonnet-5', 'claude-opus-4', 'claude-haiku-3.5'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'o1-preview'],
  google: ['gemini-3.5-flash-lite', 'gemini-2.5-pro', 'gemini-2.0-flash-lite'],
  cohere: ['command-r-plus', 'command-r'],
  openrouter: [
    'google/gemini-3.5-flash-lite',
    'openai/gpt-4o-mini',
    'anthropic/claude-3.5-sonnet',
    'meta-llama/llama-3.1-70b-instruct',
    'google/gemini-pro-1.5',
    'mistralai/mixtral-8x7b-instruct',
  ],
  groq: [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768',
    'gemma2-9b-it',
  ],
};

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  google: 'Google AI',
  cohere: 'Cohere',
  openrouter: 'OpenRouter',
  groq: 'Groq',
};

const PROVIDER_ICONS: Record<string, typeof Zap> = {
  anthropic: Zap,
  openai: Zap,
  google: Zap,
  cohere: Zap,
  openrouter: Zap,
  groq: Zap,
};

// ─── Status badge helper ──────────────────────────────────────────────────────

function StatusBadge({ provider }: { provider: ProviderStatus }) {
  const result = provider.lastTestResult;

  if (!provider.isEnabled) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
        data-icod-id="src_pages_dashboard_dashboardsettings_tsx_8b4b">Disabled
              </span>
    );
  }

  if (!result) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-medium text-warning"
        data-icod-id="src_pages_dashboard_dashboardsettings_tsx_712c">
        <AlertTriangle
          className="h-3 w-3"
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_ef16" />Not tested
              </span>
    );
  }

  if (result === 'success') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success"
        data-icod-id="src_pages_dashboard_dashboardsettings_tsx_571b">
        <CheckCircle2
          className="h-3 w-3"
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_84a5" />Connected
              </span>
    );
  }

  return (
    <Tooltip
      content={provider.lastTestError || 'Connection failed'}
      data-icod-id="src_pages_dashboard_dashboardsettings_tsx_c2b1">
      <span
        className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-medium text-destructive"
        data-icod-id="src_pages_dashboard_dashboardsettings_tsx_899e">
        <XCircle
          className="h-3 w-3"
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_4924" />
        Failed
      </span>
    </Tooltip>
  );
}

// ─── Provider Card Component ──────────────────────────────────────────────────

interface ProviderCardProps {
  provider: ProviderStatus;
  onEdit: (p: ProviderStatus) => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
  onSetPrimary: (id: string) => void;
  testStatus?: string;
  keyFormatStatus?: 'valid' | 'invalid/empty';
  /** Fresh per-provider result from the latest diagnostic run (overrides stale DB data) */
  freshDiagnostic?: ProviderDiagnosticEntry;
}

function ProviderCardItem({
  provider,
  onEdit,
  onDelete,
  onTest,
  onSetPrimary,
  testStatus,
  keyFormatStatus,
  freshDiagnostic,
}: ProviderCardProps) {
  const Icon = PROVIDER_ICONS[provider.provider] || Zap;
  const isTesting = testStatus === 'testing';
  const testSuccess = testStatus === 'success';
  const testFailed = testStatus === 'failed';

  // Use fresh diagnostic timestamp if available (from latest run), otherwise fall back to DB value
  const lastTestedAt = freshDiagnostic?.lastTested ?? provider.lastTestedAt;

  // Derive key format status from fresh diagnostic data for OpenRouter
  const resolvedKeyFormatStatus =
    provider.provider === 'openrouter'
      ? (freshDiagnostic?.keyStatus ?? keyFormatStatus)
      : keyFormatStatus;

  return (
    <Card
      className="group relative flex flex-col gap-4 p-5 transition-all duration-[250ms] hover:shadow-md"
      data-icod-id="src_pages_dashboard_dashboardsettings_tsx_ae05">
      {/* Header row */}
      <div
        className="flex items-start justify-between"
        data-icod-id="src_pages_dashboard_dashboardsettings_tsx_ec81">
        <div
          className="flex items-center gap-3"
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_e4cc">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"
            data-icod-id="src_pages_dashboard_dashboardsettings_tsx_c6c6">
            <Icon
              className="h-5 w-5 text-primary"
              data-icod-id="src_pages_dashboard_dashboardsettings_tsx_da4c" />
          </div>
          <div data-icod-id="src_pages_dashboard_dashboardsettings_tsx_feca">
            <div
              className="flex items-center gap-2"
              data-icod-id="src_pages_dashboard_dashboardsettings_tsx_9ad4">
              <h3
                className="font-semibold text-foreground"
                data-icod-id="src_pages_dashboard_dashboardsettings_tsx_ab1d">
                {PROVIDER_LABELS[provider.provider] || provider.provider}
              </h3>
              {provider.isPrimary && (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary"
                  data-icod-id="src_pages_dashboard_dashboardsettings_tsx_68b3">
                  <Star
                    className="h-3 w-3 fill-current"
                    data-icod-id="src_pages_dashboard_dashboardsettings_tsx_05e6" />
                  Primary
                </span>
              )}
            </div>
            <p
              className="text-sm text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardsettings_tsx_b281">{provider.modelName}</p>
          </div>
        </div>
        <StatusBadge
          provider={provider}
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_2126" />
      </div>
      {/* Key preview */}
      <div
        className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2"
        data-icod-id="src_pages_dashboard_dashboardsettings_tsx_7dee">
        <Key
          className="h-4 w-4 text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_31a2" />
        <span
          className="font-mono text-sm tracking-wider text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_d174">
          {provider.keyPreview}
        </span>
      </div>
      {/* Last tested timestamp — refreshed after each diagnostic run */}
      {lastTestedAt && (
        <p
          className="text-xs text-muted-foreground"
          data-icod-id={`src_pages_dashboard_dashboardsettings_tsx_lasttested_${provider._id}`}>
          Last tested: {new Date(lastTestedAt).toLocaleString()}
        </p>
      )}
      {/* Key format validation indicator for OpenRouter providers */}
      {provider.provider === 'openrouter' && resolvedKeyFormatStatus && (
        <div
          className="flex items-center gap-1.5"
          data-icod-id={`src_pages_dashboard_dashboardsettings_tsx_keyformat_${provider._id}`}>
          {resolvedKeyFormatStatus === 'valid' ? (
            <>
              <ShieldCheck
                className="h-3.5 w-3.5 text-success"
                data-icod-id={`src_pages_dashboard_dashboardsettings_tsx_keyformat_icon_${provider._id}`} />
              <span
                className="text-xs font-medium text-success"
                data-icod-id={`src_pages_dashboard_dashboardsettings_tsx_keyformat_text_${provider._id}`}>Key: valid</span>
            </>
          ) : (
            <>
              <AlertTriangle
                className="h-3.5 w-3.5 text-destructive"
                data-icod-id={`src_pages_dashboard_dashboardsettings_tsx_keyformat_warn_icon_${provider._id}`} />
              <span
                className="text-xs font-medium text-destructive"
                data-icod-id={`src_pages_dashboard_dashboardsettings_tsx_keyformat_warn_text_${provider._id}`}>Key: invalid/empty</span>
            </>
          )}
        </div>
      )}
      {/* Action buttons */}
      <div
        className="mt-auto flex flex-wrap items-center gap-2 border-t border-border/40 pt-4"
        data-icod-id="src_pages_dashboard_dashboardsettings_tsx_b3fc">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onTest(provider._id)}
          loading={isTesting}
          disabled={isTesting}
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_9833">
          {testSuccess ? (
            <>
              <CheckCircle2
                className="h-4 w-4 text-success"
                data-icod-id="src_pages_dashboard_dashboardsettings_tsx_9f6f" />
              Connected
            </>
          ) : testFailed ? (
            <>
              <XCircle
                className="h-4 w-4 text-destructive"
                data-icod-id="src_pages_dashboard_dashboardsettings_tsx_40a8" />
              Retry
            </>
          ) : (
            'Test Connection'
          )}
        </Button>

        {!provider.isPrimary && provider.isEnabled && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSetPrimary(provider._id)}
            data-icod-id="src_pages_dashboard_dashboardsettings_tsx_1a06">
            Set as Primary
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(provider)}
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_3e6f">
          Edit
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(provider._id)}
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_3ba6">
          <Trash2
            className="h-4 w-4 text-destructive"
            data-icod-id="src_pages_dashboard_dashboardsettings_tsx_2136" />
        </Button>
      </div>
    </Card>
  );
}

// ─── Add/Edit Provider Form ──────────────────────────────────────────────────

interface ProviderFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingProvider?: ProviderStatus | null;
  onSave: (data: SaveProviderData, id?: string) => void;
  isSaving: boolean;
}

function ProviderForm({ isOpen, onClose, editingProvider, onSave, isSaving }: ProviderFormProps) {
  const [provider, setProvider] = useState<string>('anthropic');
  const [modelName, setModelName] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when opening for new or edit
  useEffect(() => {
    if (isOpen) {
      if (editingProvider) {
        setProvider(editingProvider.provider);
        setModelName(editingProvider.modelName);
        setApiKey('');
        setIsEnabled(editingProvider.isEnabled);
      } else {
        setProvider('anthropic');
        setModelName(PROVIDER_MODELS.anthropic[0]);
        setApiKey('');
        setIsEnabled(true);
      }
      setErrors({});
    }
  }, [isOpen, editingProvider]);

  const handleProviderChange = (value: string) => {
    setProvider(value);
    setModelName(PROVIDER_MODELS[value]?.[0] || '');
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!provider) newErrors.provider = 'Select a provider';
    if (!modelName) newErrors.modelName = 'Select a model';
    if (!editingProvider && !apiKey) {
      newErrors.apiKey = 'API key is required';
    }
    if (apiKey && apiKey.length < 10) {
      newErrors.apiKey = 'API key must be at least 10 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const data: SaveProviderData = {
      provider: provider as SaveProviderData['provider'],
      modelName,
      apiKey,
      isEnabled,
    };

    onSave(data, editingProvider?._id);
  };

  if (!isOpen) return null;

  return (
    <Card
      className="p-6 shadow-sm"
      data-icod-id="src_pages_dashboard_dashboardsettings_tsx_0332">
      <div
        className="mb-4 flex items-center justify-between"
        data-icod-id="src_pages_dashboard_dashboardsettings_tsx_6867">
        <h3
          className="font-heading text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_8eba">
          {editingProvider ? 'Edit Provider' : 'Add New Provider'}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_e072">
          Cancel
        </Button>
      </div>
      <div
        className="flex flex-col gap-4"
        data-icod-id="src_pages_dashboard_dashboardsettings_tsx_2f66">
        <Field
          label="Provider"
          htmlFor="provider-select"
          error={errors.provider}
          required
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_3843">
          <select
            id="provider-select"
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value)}
            className={inputClass()}
            data-icod-id="src_pages_dashboard_dashboardsettings_tsx_62a2">
            {Object.entries(PROVIDER_LABELS).map(([key, label]) => (
              <option
                key={key}
                value={key}
                data-icod-id={`src_pages_dashboard_dashboardsettings_tsx_34b9_${key}`}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Model"
          htmlFor="model-select"
          error={errors.modelName}
          required
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_085f">
          <select
            id="model-select"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className={inputClass()}
            data-icod-id="src_pages_dashboard_dashboardsettings_tsx_355a">
            {(PROVIDER_MODELS[provider] || []).map((m) => (
              <option
                key={m}
                value={m}
                data-icod-id={`src_pages_dashboard_dashboardsettings_tsx_ac6e_${m}`}>
                {m}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="API Key"
          htmlFor="api-key-input"
          error={errors.apiKey}
          required={!editingProvider}
          hint={editingProvider ? 'Leave blank to keep existing key' : undefined}
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_46b0">
          <Input
            id="api-key-input"
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            autoComplete="off"
            data-icod-id="src_pages_dashboard_dashboardsettings_tsx_b2b2" />
        </Field>

        <div
          className="flex items-center gap-3"
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_af27">
          <button
            type="button"
            role="switch"
            aria-checked={isEnabled}
            onClick={() => setIsEnabled(!isEnabled)}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
              isEnabled ? 'bg-success' : 'bg-muted',
            )}
            data-icod-id="src_pages_dashboard_dashboardsettings_tsx_c225">
            <span
              className={cn(
                'pointer-events-none block h-5 w-5 transform rounded-full bg-primary-foreground shadow ring-0 transition duration-200',
                isEnabled ? 'translate-x-5' : 'translate-x-0',
              )}
              data-icod-id="src_pages_dashboard_dashboardsettings_tsx_1e99" />
          </button>
          <span
            className="text-sm font-medium text-foreground"
            data-icod-id="src_pages_dashboard_dashboardsettings_tsx_40a4">
            {isEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        <div
          className="flex justify-end pt-2"
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_36d6">
          <Button
            onClick={handleSubmit}
            loading={isSaving}
            disabled={isSaving}
            data-icod-id="src_pages_dashboard_dashboardsettings_tsx_2c6f">
            {editingProvider ? 'Update Provider' : 'Add Provider'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ─── AI Provider Health Summary ──────────────────────────────────────────────

type HealthStatus = 'connected' | 'not_configured' | 'auth_failed' | 'rate_limited' | 'unavailable' | 'not_tested';

function getHealthStatus(provider: ProviderStatus): HealthStatus {
  if (!provider.isEnabled) return 'not_configured';
  if (!provider.lastTestResult) return 'not_tested';
  if (provider.lastTestResult === 'success') return 'connected';
  if (provider.lastTestResult === 'failed') return 'auth_failed';
  if (provider.lastTestResult === 'rate_limited') return 'rate_limited';
  if (provider.lastTestResult === 'quota_exhausted') return 'rate_limited';
  if (provider.lastTestResult === 'unavailable') return 'unavailable';
  if (provider.lastTestResult === 'network_error') return 'unavailable';
  return 'not_tested';
}

const HEALTH_STATUS_CONFIG: Record<HealthStatus, { label: string; color: string; bgColor: string; icon: typeof Circle }> = {
  connected: { label: 'Connected', color: 'text-success', bgColor: 'bg-success', icon: CheckCircle2 },
  not_configured: { label: 'Not Configured', color: 'text-muted-foreground', bgColor: 'bg-muted-foreground', icon: Circle },
  auth_failed: { label: 'Authentication Failed', color: 'text-destructive', bgColor: 'bg-destructive', icon: XCircle },
  rate_limited: { label: 'Rate Limited', color: 'text-warning', bgColor: 'bg-warning', icon: AlertTriangle },
  unavailable: { label: 'Unavailable', color: 'text-destructive', bgColor: 'bg-destructive', icon: XCircle },
  not_tested: { label: 'Not Tested', color: 'text-primary', bgColor: 'bg-primary', icon: Circle },
};

interface ProviderHealthSummaryProps {
  providers: ProviderStatus[];
  onTestAll: () => void;
  isTestingAll: boolean;
  /** Fresh per-provider results from the latest diagnostic run */
  freshDiagnosticProviders?: ProviderDiagnosticEntry[];
}

function ProviderHealthSummary({ providers, onTestAll, isTestingAll, freshDiagnosticProviders = [] }: ProviderHealthSummaryProps) {
  const healthCounts = providers.reduce<Record<HealthStatus, number>>((acc, p) => {
    const status = getHealthStatus(p);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<HealthStatus, number>);

  const enabledCount = providers.filter((p) => p.isEnabled).length;
  const connectedCount = healthCounts.connected || 0;

  return (
    <DashboardCard
      heading="AI Provider Health"
      icon={<Activity
        className="h-5 w-5"
        data-icod-id="src_pages_dashboard_dashboardsettings_tsx_1f14" />}
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={onTestAll}
          loading={isTestingAll}
          disabled={isTestingAll || enabledCount === 0}
          data-icod-id="dashboard_settings_test_all_btn">
          <RefreshCw className="h-3 w-3" data-icod-id="dashboard_settings_test_all_icon" />
          Test All Providers
        </Button>
      }
      data-icod-id="dashboard_settings_health_summary">
      {/* Summary stats */}
      <div className="mb-4 flex items-center gap-4 text-sm" data-icod-id="dashboard_settings_health_stats">
        <span className="text-muted-foreground" data-icod-id="dashboard_settings_health_total">
          {providers.length} provider{providers.length !== 1 ? 's' : ''} configured
        </span>
        <span className="text-muted-foreground" data-icod-id="dashboard_settings_health_enabled">
          {enabledCount} enabled
        </span>
        <span className="font-medium text-success" data-icod-id="dashboard_settings_health_connected">
          {connectedCount} connected
        </span>
      </div>
      {/* Provider status grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" data-icod-id="dashboard_settings_health_grid">
        {providers.map((provider) => {
          const status = getHealthStatus(provider);
          const config = HEALTH_STATUS_CONFIG[status];
          const StatusIcon = config.icon;

          return (
            <div
              key={provider._id}
              className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 px-4 py-3"
              data-icod-id={`dashboard_settings_health_item_${provider._id}`}>
              <StatusIcon
                className={`h-5 w-5 shrink-0 ${config.color}`}
                data-icod-id={`dashboard_settings_health_icon_${provider._id}`} />
              <div className="min-w-0 flex-1" data-icod-id={`dashboard_settings_health_info_${provider._id}`}>
                <p className="truncate text-sm font-medium text-foreground" data-icod-id={`dashboard_settings_health_name_${provider._id}`}>
                  {PROVIDER_LABELS[provider.provider] || provider.provider}
                </p>
                <p className={`text-xs ${config.color}`} data-icod-id={`dashboard_settings_health_status_${provider._id}`}>
                  {config.label}
                </p>
                {/* Use fresh diagnostic timestamp if available, otherwise fall back to DB value */}
                {(freshDiagnosticProviders.find((fp) => fp.provider === provider.provider)?.lastTested ?? provider.lastTestedAt) && (
                  <p className="mt-0.5 text-[10px] text-muted-foreground" data-icod-id={`dashboard_settings_health_lasttested_${provider._id}`}>
                    Last tested: {new Date(freshDiagnosticProviders.find((fp) => fp.provider === provider.provider)?.lastTested ?? provider.lastTestedAt!).toLocaleString()}
                  </p>
                )}
              </div>
              <span className="font-mono text-[10px] text-muted-foreground" data-icod-id={`dashboard_settings_health_key_${provider._id}`}>
                {provider.keyPreview}
              </span>
            </div>
          );
        })}
      </div>
      {providers.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground" data-icod-id="dashboard_settings_health_empty">
          No providers configured yet. Add a provider below to get started.
        </p>
      )}
    </DashboardCard>
  );
}

// ─── Fallback Chain Panel ─────────────────────────────────────────────────────

function FallbackChainPanel({ providers }: { providers: ProviderStatus[] }) {
  const enabledProviders = providers
    .filter((p) => p.isEnabled)
    .sort((a, b) => a.fallbackOrder - b.fallbackOrder);

  if (enabledProviders.length <= 1) return null;

  return (
    <DashboardCard
      heading="Fallback Chain"
      data-icod-id="src_pages_dashboard_dashboardsettings_tsx_d80f">
      <p
        className="mb-4 text-sm text-muted-foreground"
        data-icod-id="src_pages_dashboard_dashboardsettings_tsx_49ae">
        If the primary provider fails, requests fall back in this order:
      </p>
      <div
        className="flex flex-col gap-2"
        data-icod-id="src_pages_dashboard_dashboardsettings_tsx_abac">
        {enabledProviders.map((p, idx) => (
          <div
            key={p._id}
            className={cn(
              'flex items-center gap-3 rounded-lg border px-4 py-3',
              p.isPrimary
                ? 'border-primary/30 bg-primary/5'
                : 'border-border bg-muted/30',
            )}
            data-icod-id={`src_pages_dashboard_dashboardsettings_tsx_18d0_${p._id}`}>
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
              data-icod-id={`src_pages_dashboard_dashboardsettings_tsx_0198_${p._id}`}>
              {idx + 1}
            </span>
            <div
              className="min-w-0 flex-1"
              data-icod-id={`src_pages_dashboard_dashboardsettings_tsx_1b1f_${p._id}`}>
              <span
                className="text-sm font-medium text-foreground"
                data-icod-id={`src_pages_dashboard_dashboardsettings_tsx_3ff3_${p._id}`}>
                {PROVIDER_LABELS[p.provider] || p.provider}
              </span>
              <span
                className="ml-2 text-xs text-muted-foreground"
                data-icod-id={`src_pages_dashboard_dashboardsettings_tsx_3ae8_${p._id}`}>{p.modelName}</span>
            </div>
            {p.isPrimary && (
              <span
                className="text-xs font-bold text-primary"
                data-icod-id={`src_pages_dashboard_dashboardsettings_tsx_66da_${p._id}`}>Primary</span>
            )}
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

// ─── AI Diagnostic Panel ────────────────────────────────────────────────────────

function DiagnosticStatusBadge({ status }: { status: DiagnosticResult['status'] }) {
  if (status === 'PASS') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success"
        data-icod-id="src_pages_dashboard_dashboardsettings_tsx_57c5">
        <CheckCircle2
          className="h-3 w-3"
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_5f7f" />PASS
              </span>
    );
  }
  if (status === 'FAIL') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-medium text-destructive"
        data-icod-id="src_pages_dashboard_dashboardsettings_tsx_4bf6">
        <XCircle
          className="h-3 w-3"
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_cb0e" />FAIL
              </span>
    );
  }
  // NOT_CONFIGURED
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-medium text-warning"
      data-icod-id="src_pages_dashboard_dashboardsettings_tsx_696f">
      <AlertTriangle
        className="h-3 w-3"
        data-icod-id="src_pages_dashboard_dashboardsettings_tsx_274e" />N/A
          </span>
  );
}

interface DiagnosticPanelProps {
  onDiagnosticComplete?: (freshProviders: ProviderDiagnosticEntry[]) => void;
  /** Pre-loaded diagnostic results from a saved run (restored on page mount) */
  initialResults?: DiagnosticResponse | null;
}

function DiagnosticPanel({ onDiagnosticComplete, initialResults }: DiagnosticPanelProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResponse | null>(initialResults ?? null);
  const [error, setError] = useState<string | null>(null);
  // Monotonic run counter ensures each diagnostic run produces a unique state
  // transition, preventing stale closures or cached responses from appearing
  // identical to the previous run.
  const [runId, setRunId] = useState(0);

  // Sync results when initialResults arrives asynchronously (parent fetches on mount).
  // useState only captures the value at first render; the parent's useEffect may
  // deliver the saved diagnostic data after this component has already mounted
  // with initialResults === null. This effect bridges that gap.
  useEffect(() => {
    if (initialResults) {
      setResults(initialResults);
    }
  }, [initialResults]);

  const handleRunDiagnostic = useCallback(async () => {
    const currentRunId = Date.now();
    setRunId(currentRunId);
    setIsRunning(true);
    setError(null);
    setResults(null);

    try {
      const response = await runDiagnostic();
      // Only update if this is still the latest run (guards against race conditions
      // when the user clicks "Run Diagnostic" multiple times quickly)
      setResults((prev) => {
        // Always accept the new response — runId tracking prevents stale updates
        return response;
      });
      // Notify parent to refresh provider cards with fresh data from this run
      onDiagnosticComplete?.(response.providers ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run diagnostic');
    } finally {
      setIsRunning(false);
    }
  }, [onDiagnosticComplete]);

  return (
    <DashboardCard
      heading="AI Infrastructure Diagnostic"
      icon={<Stethoscope
        className="h-5 w-5"
        data-icod-id="src_pages_dashboard_dashboardsettings_tsx_e5ed" />}
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={handleRunDiagnostic}
          loading={isRunning}
          disabled={isRunning}
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_7ae1">
          <RefreshCw
            className="h-3 w-3"
            data-icod-id="src_pages_dashboard_dashboardsettings_tsx_21ee" />
          {isRunning ? 'Running...' : 'Run Diagnostic'}
        </Button>
      }
      data-icod-id="src_pages_dashboard_dashboardsettings_tsx_eca2">
      {!results && !error && !isRunning && !initialResults && (
        <div
          className="py-8 text-center"
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_e233">
          <p
            className="text-sm text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardsettings_tsx_a374">
            Run a comprehensive diagnostic to test all AI providers, tools, and fallback chains.
            This may take 30-60 seconds.
          </p>
        </div>
      )}
      {error && (
        <Alert
          variant="error"
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_52db">
          {error}
        </Alert>
      )}
      {isRunning && !results && (
        <div
          className="flex flex-col items-center justify-center py-12"
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_d278">
          <RefreshCw
            className="h-8 w-8 animate-spin text-primary"
            data-icod-id="src_pages_dashboard_dashboardsettings_tsx_1226" />
          <p
            className="mt-4 text-sm text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardsettings_tsx_5c31">
            Running comprehensive AI diagnostic...
          </p>
          <p
            className="text-xs text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardsettings_tsx_109d">
            Testing providers, chatbot, parsers, and tools
          </p>
        </div>
      )}
      {results && (
        <div
          key={runId}
          className="flex flex-col gap-4"
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_595f">
          {/* Summary stats */}
          <div
            className="flex flex-wrap items-center gap-4 rounded-lg bg-muted/30 px-4 py-3"
            data-icod-id="src_pages_dashboard_dashboardsettings_tsx_ecbb">
            <div
              className="flex items-center gap-2"
              data-icod-id="src_pages_dashboard_dashboardsettings_tsx_2850">
              <span
                className="text-sm font-medium text-foreground"
                data-icod-id="src_pages_dashboard_dashboardsettings_tsx_4e9b">Summary:</span>
              <span
                className="text-sm text-success"
                data-icod-id="src_pages_dashboard_dashboardsettings_tsx_c77e">{results.summary.passed} passed</span>
              <span
                className="text-sm text-destructive"
                data-icod-id="src_pages_dashboard_dashboardsettings_tsx_4c1d">{results.summary.failed} failed</span>
              <span
                className="text-sm text-warning"
                data-icod-id="src_pages_dashboard_dashboardsettings_tsx_c948">{results.summary.notConfigured} not configured</span>
            </div>
            <div
              className="ml-auto text-xs text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardsettings_tsx_0936">
              {new Date(results.timestamp).toLocaleTimeString()}
            </div>
          </div>

          {/* Provider chain info */}
          <div
            className="rounded-lg border border-border/40 bg-muted/20 px-4 py-3"
            data-icod-id="src_pages_dashboard_dashboardsettings_tsx_2357">
            <p
              className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardsettings_tsx_b328">
              Provider Chain
            </p>
            <div
              className="flex flex-wrap gap-x-6 gap-y-1 text-sm"
              data-icod-id="src_pages_dashboard_dashboardsettings_tsx_aad0">
              <span
                className="text-foreground"
                data-icod-id="src_pages_dashboard_dashboardsettings_tsx_94a8">
                <span
                  className="font-medium text-primary"
                  data-icod-id="src_pages_dashboard_dashboardsettings_tsx_aec8">Primary:</span> {results.providerChain.primary}
              </span>
              <span
                className="text-foreground"
                data-icod-id="src_pages_dashboard_dashboardsettings_tsx_3223">
                <span
                  className="font-medium"
                  data-icod-id="src_pages_dashboard_dashboardsettings_tsx_ff4d">Fallback 1:</span> {results.providerChain.fallback1}
              </span>
              <span
                className="text-foreground"
                data-icod-id="src_pages_dashboard_dashboardsettings_tsx_11fe">
                <span
                  className="font-medium"
                  data-icod-id="src_pages_dashboard_dashboardsettings_tsx_26f0">Fallback 2:</span> {results.providerChain.fallback2}
              </span>
            </div>
          </div>

          {/* Database issues */}
          {results.databaseIssues.length > 0 && (
            <Alert
              variant="warning"
              data-icod-id="src_pages_dashboard_dashboardsettings_tsx_1659">
              <p
                className="font-medium"
                data-icod-id="src_pages_dashboard_dashboardsettings_tsx_7e05">Database Issues:</p>
              <ul
                className="mt-1 list-inside list-disc text-sm"
                data-icod-id="src_pages_dashboard_dashboardsettings_tsx_0597">
                {results.databaseIssues.map((issue, i) => (
                  <li
                    key={i}
                    data-icod-id={`src_pages_dashboard_dashboardsettings_tsx_b4a6_${i}`}>{issue}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Results table */}
          <div
            className="overflow-x-auto"
            data-icod-id="src_pages_dashboard_dashboardsettings_tsx_b9d0">
            <table
              className="w-full text-left text-sm"
              data-icod-id="src_pages_dashboard_dashboardsettings_tsx_f2bf">
              <thead data-icod-id="src_pages_dashboard_dashboardsettings_tsx_9c36">
                <tr
                  className="border-b border-border/40"
                  data-icod-id="src_pages_dashboard_dashboardsettings_tsx_7d42">
                  <th
                    className="px-3 py-2 font-medium text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsettings_tsx_c742">Component</th>
                  <th
                    className="px-3 py-2 font-medium text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsettings_tsx_2a63">Status</th>
                  <th
                    className="px-3 py-2 font-medium text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsettings_tsx_5007">Evidence</th>
                </tr>
              </thead>
              <tbody data-icod-id="src_pages_dashboard_dashboardsettings_tsx_5581">
                {results.results.map((result, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-border/20 last:border-0"
                    data-icod-id={`src_pages_dashboard_dashboardsettings_tsx_c433_${idx}`}>
                    <td
                      className="px-3 py-2 font-medium text-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardsettings_tsx_bb31_${idx}`}>
                      {result.component}
                    </td>
                    <td
                      className="px-3 py-2"
                      data-icod-id={`src_pages_dashboard_dashboardsettings_tsx_3f6f_${idx}`}>
                      <DiagnosticStatusBadge
                        status={result.status}
                        data-icod-id={`src_pages_dashboard_dashboardsettings_tsx_d5ed_${idx}`} />
                    </td>
                    <td
                      className="max-w-md truncate px-3 py-2 text-xs text-muted-foreground"
                      title={result.evidence}
                      data-icod-id={`src_pages_dashboard_dashboardsettings_tsx_d621_${idx}`}>
                      {result.evidence}
                      {result.latency !== undefined && (
                        <span
                          className="ml-2 text-[10px] opacity-60"
                          data-icod-id={`src_pages_dashboard_dashboardsettings_tsx_373e_${idx}`}>
                          ({(result.latency / 1000).toFixed(1)}s)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function DashboardSettings() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const { providers, status, saveStatus, testStatus, error } = useAppSelector(
    (state) => state.aiSettings,
  );

  const [showForm, setShowForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ProviderStatus | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [formExpanded, setFormExpanded] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(DEFAULT_AVATAR_URL);
  const [isTestingAll, setIsTestingAll] = useState(false);
  // Monotonic key for provider cards section — incremented after each diagnostic run
  // to force React to re-render the cards with fresh data from the refetched Redux state.
  const [providerCardsKey, setProviderCardsKey] = useState(0);
  // Fresh per-provider diagnostic entries from the latest diagnostic run.
  // Used to update provider card timestamps, statuses, and OpenRouter key verdict
  // without waiting for a full Redux re-fetch (which may return stale DB data).
  const [freshDiagnosticProviders, setFreshDiagnosticProviders] = useState<ProviderDiagnosticEntry[]>([]);

  // Handle avatar upload — convert file to object URL for preview
  const handleAvatarUpload = useCallback((file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setAvatarUrl(objectUrl);
    dispatch(addToast({ message: 'Profile photo updated', variant: 'success' }));
  }, [dispatch]);

  // Handle avatar remove — revert to gradient placeholder
  const handleAvatarRemove = useCallback(() => {
    setAvatarUrl(null);
    dispatch(addToast({ message: 'Profile photo removed', variant: 'success' }));
  }, [dispatch]);

  // Fetch providers on mount
  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(fetchProviderStatuses());
    }
  }, [dispatch, user]);

  // Fetch latest saved diagnostic results on mount so cards, verdict badge,
  // and results table survive a page reload without re-running the diagnostic.
  const [savedDiagnosticResults, setSavedDiagnosticResults] = useState<DiagnosticResponse | null>(null);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    let cancelled = false;
    getLatestDiagnosticResults().then((data) => {
      if (cancelled || !data) return;
      setSavedDiagnosticResults(data);
      // Populate fresh provider data from the saved run so cards show
      // correct "Last tested" times and OpenRouter key verdict on load.
      if (data.providers && data.providers.length > 0) {
        setFreshDiagnosticProviders(data.providers);
      }
    });
    return () => { cancelled = true; };
  }, [user]);

  // Handle save success/failure with toasts
  useEffect(() => {
    if (saveStatus === 'saved') {
      dispatch(addToast({ message: 'Provider saved successfully', variant: 'success' }));
      dispatch(clearSaveStatus());
      setShowForm(false);
      setEditingProvider(null);
      setFormExpanded(false);
    } else if (saveStatus === 'failed') {
      dispatch(addToast({ message: error || 'Failed to save provider', variant: 'error' }));
    }
  }, [saveStatus, error, dispatch]);

  const handleSave = useCallback(
    (data: SaveProviderData, id?: string) => {
      dispatch(saveProviderConfig({ data, id }));
    },
    [dispatch],
  );

  const handleDelete = useCallback(
    (id: string) => {
      setDeleteTarget(id);
    },
    [],
  );

  const confirmDelete = useCallback(() => {
    if (deleteTarget) {
      dispatch(deleteProviderConfig(deleteTarget)).then(() => {
        dispatch(addToast({ message: 'Provider deleted', variant: 'success' }));
      });
      setDeleteTarget(null);
    }
  }, [deleteTarget, dispatch]);

  const handleTest = useCallback(
    (id: string) => {
      dispatch(testProviderConnection(id)).then((result) => {
        if (testProviderConnection.fulfilled.match(result)) {
          const testResult = result.payload.lastTestResult;
          if (testResult === 'success') {
            dispatch(addToast({ message: 'Connection successful', variant: 'success' }));
          } else {
            dispatch(
              addToast({
                message: result.payload.lastTestError || 'Connection failed',
                variant: 'error',
              }),
            );
          }
        } else {
          dispatch(addToast({ message: 'Test failed — network error', variant: 'error' }));
        }
        // Reset test status after a delay so UI updates properly
        setTimeout(() => {
          dispatch(resetTestStatus(id));
        }, 5000);
      });
    },
    [dispatch],
  );

  const handleSetPrimary = useCallback(
    (id: string) => {
      dispatch(setPrimaryProvider(id)).then(() => {
        dispatch(addToast({ message: 'Primary provider updated', variant: 'success' }));
      });
    },
    [dispatch],
  );

  const handleTestAll = useCallback(async () => {
    setIsTestingAll(true);
    const enabledProviders = providers.filter((p) => p.isEnabled);
    let successCount = 0;
    let failCount = 0;

    for (const provider of enabledProviders) {
      try {
        const result = await dispatch(testProviderConnection(provider._id));
        if (testProviderConnection.fulfilled.match(result)) {
          if (result.payload.lastTestResult === 'success') {
            successCount++;
          } else {
            failCount++;
          }
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
      // Reset test status after delay
      setTimeout(() => {
        dispatch(resetTestStatus(provider._id));
      }, 5000);
    }

    setIsTestingAll(false);
    if (failCount === 0 && successCount > 0) {
      dispatch(addToast({ message: `All ${successCount} provider(s) connected successfully`, variant: 'success' }));
    } else if (successCount > 0) {
      dispatch(addToast({ message: `${successCount} connected, ${failCount} failed`, variant: 'info' }));
    } else {
      dispatch(addToast({ message: 'All provider tests failed', variant: 'error' }));
    }
  }, [providers, dispatch]);

  const handleEdit = useCallback((provider: ProviderStatus) => {
    setEditingProvider(provider);
    setShowForm(true);
    setFormExpanded(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditingProvider(null);
    setFormExpanded(false);
  }, []);

  // Called after each diagnostic run to refresh provider cards with fresh data.
  // Stores the per-provider results from the diagnostic response directly, then
  // re-fetches from the server (with cache-busting) and bumps the React key
  // so the provider cards section fully re-renders with both fresh timestamps
  // and any DB-level changes.
  const handleDiagnosticComplete = useCallback((freshProviders: ProviderDiagnosticEntry[]) => {
    setFreshDiagnosticProviders(freshProviders);
    dispatch(fetchProviderStatuses());
    setProviderCardsKey((k) => k + 1);
  }, [dispatch]);

  const isLoading = status === 'loading';

  // Admin-only access — redirect non-admin users (after all hooks)
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div
      className="flex flex-col gap-8"
      data-icod-id="src_pages_dashboard_dashboardsettings_tsx_15ca">
      {/* Header */}
      <div data-icod-id="src_pages_dashboard_dashboardsettings_tsx_8b74">
        <div
          className="flex items-center gap-3"
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_2b7a">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"
            data-icod-id="src_pages_dashboard_dashboardsettings_tsx_496b">
            <Settings
              className="h-5 w-5 text-primary"
              data-icod-id="src_pages_dashboard_dashboardsettings_tsx_4216" />
          </div>
          <div data-icod-id="src_pages_dashboard_dashboardsettings_tsx_a30c">
            <h1
              className="font-heading text-2xl font-bold text-foreground sm:text-3xl"
              data-icod-id="src_pages_dashboard_dashboardsettings_tsx_8dc7">
              AI Provider Settings
            </h1>
            <p
              className="mt-1 text-sm text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardsettings_tsx_6386">
              Configure and manage your AI provider connections. Set up fallback chains for reliable service.
            </p>
          </div>
        </div>
      </div>
      {/* AI Provider Health Summary — keyed to re-render after diagnostic runs */}
      <ProviderHealthSummary
        key={`health-summary-${providerCardsKey}`}
        providers={providers}
        onTestAll={handleTestAll}
        isTestingAll={isTestingAll}
        freshDiagnosticProviders={freshDiagnosticProviders}
        data-icod-id="dashboard_settings_health_panel" />
      {/* Profile Card with Avatar */}
      <Card
        className="overflow-hidden"
        style={{ backgroundColor: 'rgb(var(--card))' }}
        data-icod-id="profile_card_container"
      >
        <div className="flex flex-col items-center px-6 py-2" data-icod-id="profile_card_content">
          <ProfileAvatar
            imageUrl={avatarUrl}
            onUpload={handleAvatarUpload}
            onRemove={handleAvatarRemove}
            data-icod-id="profile_avatar_component"
          />
        </div>
      </Card>
      {/* Error alert */}
      {error && status === 'failed' && (
        <Alert
          variant="error"
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_a12d">{error}</Alert>
      )}
      {/* Add / Edit form */}
      <div data-icod-id="src_pages_dashboard_dashboardsettings_tsx_6e98">
        {!formExpanded ? (
          <Button
            onClick={() => {
              setEditingProvider(null);
              setShowForm(true);
              setFormExpanded(true);
            }}
            data-icod-id="src_pages_dashboard_dashboardsettings_tsx_ab71">
            <Plus
              className="h-4 w-4"
              data-icod-id="src_pages_dashboard_dashboardsettings_tsx_dde1" />
            Add Provider
          </Button>
        ) : (
          <ProviderForm
            isOpen={showForm}
            onClose={handleCloseForm}
            editingProvider={editingProvider}
            onSave={handleSave}
            isSaving={saveStatus === 'saving'}
            data-icod-id="src_pages_dashboard_dashboardsettings_tsx_2f42" />
        )}
      </div>
      {/* Provider cards — keyed by providerCardsKey to force re-render after diagnostic runs */}
      {isLoading ? (
        <div
          key={`provider-skeleton-${providerCardsKey}`}
          className="grid gap-4 sm:grid-cols-2"
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_c18e">
          {[1, 2].map((i) => (
            <Skeleton
              key={i}
              variant="card"
              data-icod-id={`src_pages_dashboard_dashboardsettings_tsx_36d8_${i}`} />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <DashboardCard
          heading="Configured Providers"
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_82e3">
          <div
            className="flex flex-col items-center justify-center py-12 text-center"
            data-icod-id="src_pages_dashboard_dashboardsettings_tsx_2f20">
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"
              data-icod-id="src_pages_dashboard_dashboardsettings_tsx_2ed9">
              <Zap
                className="h-8 w-8 text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardsettings_tsx_111a" />
            </div>
            <h3
              className="mb-2 font-semibold text-foreground"
              data-icod-id="src_pages_dashboard_dashboardsettings_tsx_c7ed">No providers configured</h3>
            <p
              className="mb-4 max-w-sm text-sm text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardsettings_tsx_3af6">
              Add an AI provider to get started. You can configure multiple providers and set up a fallback chain.
            </p>
          </div>
        </DashboardCard>
      ) : (
        <div
          key={`provider-cards-${providerCardsKey}`}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_f711">
          {providers.map((provider) => {
            // Look up fresh diagnostic data for this provider (if available from latest run)
            const freshEntry = freshDiagnosticProviders.find(
              (fp) => fp.provider === provider.provider,
            );
            return (
              <ProviderCardItem
                key={provider._id}
                provider={provider}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTest={handleTest}
                onSetPrimary={handleSetPrimary}
                testStatus={testStatus[provider._id]}
                freshDiagnostic={freshEntry}
                data-icod-id={`src_pages_dashboard_dashboardsettings_tsx_8896_${provider._id}`} />
            );
          })}
        </div>
      )}
      {/* Fallback chain — keyed to re-render after diagnostic runs */}
      <FallbackChainPanel
        key={`fallback-chain-${providerCardsKey}`}
        providers={providers}
        data-icod-id="src_pages_dashboard_dashboardsettings_tsx_3a76" />
      {/* AI Diagnostic Panel (admin only) */}
      <DiagnosticPanel
        onDiagnosticComplete={handleDiagnosticComplete}
        initialResults={savedDiagnosticResults}
        data-icod-id="src_pages_dashboard_dashboardsettings_tsx_79b8" />
      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Provider"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-icod-id="src_pages_dashboard_dashboardsettings_tsx_1375">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              data-icod-id="src_pages_dashboard_dashboardsettings_tsx_45b6">
              Delete
            </Button>
          </>
        }
        data-icod-id="src_pages_dashboard_dashboardsettings_tsx_a0a9">
        <p
          className="text-sm text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardsettings_tsx_ef67">
          Are you sure you want to delete this provider configuration? This action cannot be undone.
          The API key will be permanently removed from the database.
        </p>
      </Modal>
    </div>
  );
}
