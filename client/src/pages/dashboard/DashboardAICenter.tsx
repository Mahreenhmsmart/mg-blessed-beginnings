import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Wrench,
  Settings,
  BookOpen,
  Send,
  Search,
  FileText,
  Hash,
  Calculator,
  Users,
  PenTool,
  Type,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Copy,
  Trash2,
  Plus,
  Tag,
} from 'lucide-react';
import { Button, Card, Badge, Input, Spinner, Alert, EmptyState, Modal, Field } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { sendChatbotMessage, aiService, runDiagnostic, type ProviderStatus, type DiagnosticResponse } from '@/services/aiService';

// ─── Types ─────────────────────────────────────────────────────────────────────

type TabId = 'assistant' | 'tools' | 'providers' | 'prompts';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AITool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  slug: string;
  category: string;
}

interface PromptTemplate {
  id: string;
  title: string;
  content: string;
  category: PromptCategory;
  variables: string[];
}

type PromptCategory = 'SEO' | 'Marketing' | 'E-commerce' | 'Content';

// ─── Constants ─────────────────────────────────────────────────────────────────

const AI_TOOLS: AITool[] = [
  {
    id: 'seo-title',
    name: 'SEO Title Optimizer',
    description: 'Generate optimized page titles for better search rankings',
    icon: Search,
    slug: 'seo-title-optimizer',
    category: 'SEO',
  },
  {
    id: 'product-desc',
    name: 'Product Description Generator',
    description: 'Create compelling product descriptions that convert',
    icon: FileText,
    slug: 'product-description-generator',
    category: 'E-commerce',
  },
  {
    id: 'hashtag',
    name: 'Hashtag Generator',
    description: 'Generate trending hashtags for social media posts',
    icon: Hash,
    slug: 'hashtag-generator',
    category: 'Marketing',
  },
  {
    id: 'competitor',
    name: 'Competitor Analyzer',
    description: 'Analyze competitor strategies and find opportunities',
    icon: Users,
    slug: 'competitor-analyzer',
    category: 'SEO',
  },
  {
    id: 'blog-post',
    name: 'Blog Post Generator',
    description: 'Generate engaging blog posts on any topic',
    icon: PenTool,
    slug: 'blog-post-generator',
    category: 'Content',
  },
  {
    id: 'meta-desc',
    name: 'Meta Description Generator',
    description: 'Write compelling meta descriptions for your pages',
    icon: Type,
    slug: 'meta-description-generator',
    category: 'SEO',
  },
  {
    id: 'email-subject',
    name: 'Email Subject Line Generator',
    description: 'Create attention-grabbing email subject lines',
    icon: Mail,
    slug: 'email-subject-line-generator',
    category: 'Marketing',
  },
];

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'seo-1',
    title: 'Keyword Research Prompt',
    content: 'Generate a comprehensive list of long-tail keywords related to "{{topic}}" for my {{industry}} business. Include search intent and difficulty estimates.',
    category: 'SEO',
    variables: ['topic', 'industry'],
  },
  {
    id: 'seo-2',
    title: 'Content Brief Generator',
    content: 'Create a detailed content brief for an article about "{{topic}}". Include target keywords, word count, headings structure, and key points to cover.',
    category: 'SEO',
    variables: ['topic'],
  },
  {
    id: 'marketing-1',
    title: 'Social Media Caption',
    content: 'Write an engaging social media caption for {{platform}} promoting "{{product}}". Use a {{tone}} tone and include relevant emojis and hashtags.',
    category: 'Marketing',
    variables: ['platform', 'product', 'tone'],
  },
  {
    id: 'marketing-2',
    title: 'Ad Copy Generator',
    content: 'Create compelling ad copy for {{platform}} advertising "{{product}}". Target audience: {{audience}}. Key benefit: {{benefit}}.',
    category: 'Marketing',
    variables: ['platform', 'product', 'audience', 'benefit'],
  },
  {
    id: 'ecommerce-1',
    title: 'Product Feature List',
    content: 'Generate a bullet-point list of features and benefits for "{{product}}". Focus on unique selling points and customer value propositions.',
    category: 'E-commerce',
    variables: ['product'],
  },
  {
    id: 'ecommerce-2',
    title: 'Customer Review Response',
    content: 'Write a professional response to this customer review: "{{review}}". Address their concerns and maintain brand voice.',
    category: 'E-commerce',
    variables: ['review'],
  },
  {
    id: 'content-1',
    title: 'Blog Outline Creator',
    content: 'Create a detailed outline for a blog post titled "{{title}}". Include H2 and H3 headings, key talking points, and estimated word counts per section.',
    category: 'Content',
    variables: ['title'],
  },
  {
    id: 'content-2',
    title: 'Newsletter Draft',
    content: 'Draft a newsletter about "{{topic}}" for {{audience}}. Include a catchy subject line, introduction, main content sections, and call-to-action.',
    category: 'Content',
    variables: ['topic', 'audience'],
  },
];

const PROMPT_CATEGORIES: PromptCategory[] = ['SEO', 'Marketing', 'E-commerce', 'Content'];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function DashboardAICenter() {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<TabId>('assistant');

  // AI Assistant state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Provider Management state
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState<string | null>(null);
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticResponse | null>(null);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [testingProviderId, setTestingProviderId] = useState<string | null>(null);

  // Prompt Library state
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | 'All'>('All');
  const [savedPrompts, setSavedPrompts] = useState<PromptTemplate[]>(PROMPT_TEMPLATES);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [newPromptCategory, setNewPromptCategory] = useState<PromptCategory>('SEO');

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load providers when tab changes
  useEffect(() => {
    if (activeTab === 'providers') {
      loadProviders();
    }
  }, [activeTab]);

  const loadProviders = async () => {
    setProvidersLoading(true);
    setProvidersError(null);
    try {
      const data = await aiService.getProviderStatuses();
      setProviders(data);
    } catch (err) {
      setProvidersError(err instanceof Error ? err.message : 'Failed to load provider statuses');
    } finally {
      setProvidersLoading(false);
    }
  };

  const runFullDiagnostic = async () => {
    setDiagnosticLoading(true);
    setProvidersError(null);
    try {
      const result = await runDiagnostic();
      setDiagnosticData(result);
      // Also refresh providers list
      await loadProviders();
      dispatch(addToast({ message: 'Diagnostic complete', variant: 'success' }));
    } catch (err) {
      setProvidersError(err instanceof Error ? err.message : 'Failed to run diagnostic');
      dispatch(addToast({ message: 'Diagnostic failed', variant: 'error' }));
    } finally {
      setDiagnosticLoading(false);
    }
  };

  const handleTestConnection = async (providerId: string) => {
    setTestingProviderId(providerId);
    try {
      const result = await aiService.testConnection(providerId);
      dispatch(addToast({
        message: result.lastTestResult === 'success' ? 'Connection test passed!' : `Test result: ${result.lastTestResult}`,
        variant: result.lastTestResult === 'success' ? 'success' : 'error',
      }));
      // Refresh providers to show updated status
      await loadProviders();
    } catch (err) {
      dispatch(addToast({ message: 'Connection test failed', variant: 'error' }));
    } finally {
      setTestingProviderId(null);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);

    try {
      const response = await sendChatbotMessage(userMessage.content);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.success && response.answer
          ? response.answer
          : response.error || 'Sorry, I encountered an error processing your request.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (!response.success) {
        dispatch(addToast({ message: response.error || 'AI response failed', variant: 'error' }));
      }
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Unable to connect to the AI service. Please try again later.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      dispatch(addToast({ message: 'Failed to send message', variant: 'error' }));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    dispatch(addToast({ message: 'Copied to clipboard', variant: 'success' }));
  };

  const saveCustomPrompt = () => {
    if (!newPromptTitle.trim() || !newPromptContent.trim()) {
      dispatch(addToast({ message: 'Title and content are required', variant: 'error' }));
      return;
    }

    const newPrompt: PromptTemplate = {
      id: `custom-${Date.now()}`,
      title: newPromptTitle.trim(),
      content: newPromptContent.trim(),
      category: newPromptCategory,
      variables: [],
    };

    setSavedPrompts((prev) => [...prev, newPrompt]);
    setShowSaveModal(false);
    setNewPromptTitle('');
    setNewPromptContent('');
    dispatch(addToast({ message: 'Prompt saved successfully', variant: 'success' }));
  };

  const deletePrompt = (id: string) => {
    setSavedPrompts((prev) => prev.filter((p) => p.id !== id));
    dispatch(addToast({ message: 'Prompt deleted', variant: 'info' }));
  };

  const filteredPrompts = selectedCategory === 'All'
    ? savedPrompts
    : savedPrompts.filter((p) => p.category === selectedCategory);

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return (
          <CheckCircle2
            className="h-4 w-4 text-success"
            data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_803d" />
        );
      case 'failed':
        return (
          <XCircle
            className="h-4 w-4 text-destructive"
            data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_bfed" />
        );
      case 'rate_limited':
      case 'quota_exhausted':
        return (
          <AlertCircle
            className="h-4 w-4 text-warning"
            data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_4995" />
        );
      default:
        return (
          <Clock
            className="h-4 w-4 text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_f719" />
        );
    }
  };

  const getStatusBadgeVariant = (result?: string): 'ai' | 'new' | 'free' | 'category' | 'default' => {
    switch (result) {
      case 'success':
        return 'ai';
      case 'failed':
      case 'unavailable':
        return 'new';
      case 'rate_limited':
      case 'quota_exhausted':
        return 'free';
      default:
        return 'default';
    }
  };

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'assistant', label: 'AI Assistant', icon: MessageSquare },
    { id: 'tools', label: 'AI Tools', icon: Wrench },
    { id: 'providers', label: 'Provider Management', icon: Settings },
    { id: 'prompts', label: 'Prompt Library', icon: BookOpen },
  ];

  return (
    <div
      className="space-y-6"
      data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_585e">
      {/* Header */}
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_a2d6">
        <div data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_1b4a">
          <h1
            className="text-2xl font-bold text-foreground"
            data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_651d">AI Center</h1>
          <p
            className="text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_9b22">
            Access AI-powered tools and manage your AI providers
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setActiveTab('assistant');
            setInputValue('');
          }}
          data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_1cdb">
          <Sparkles
            className="mr-2 h-4 w-4"
            data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_3cd6" />
          New Conversation
        </Button>
      </div>
      {/* Tabs */}
      <Card
        className="p-1"
        data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_f8c2">
        <div
          className="flex flex-wrap gap-1"
          data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_c358">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
              data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_a695_${tab.id}`}>
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </Card>
      {/* Tab Content */}
      <div
        className="min-h-[500px]"
        data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_d869">
        {/* AI Assistant Tab */}
        {activeTab === 'assistant' && (
          <Card
            className="flex h-[600px] flex-col overflow-hidden"
            data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_f796">
            {/* Messages Area */}
            <div
              className="flex-1 overflow-y-auto p-4"
              data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_d65b">
              {messages.length === 0 ? (
                <EmptyState
                  icon={Sparkles}
                  title="Start a Conversation"
                  description="Ask the AI assistant anything about SEO, marketing, or your business strategy."
                  data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_b9f2" />
              ) : (
                <div
                  className="space-y-4"
                  data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_baa4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex w-full',
                        msg.role === 'user' ? 'justify-end' : 'justify-start',
                      )}
                      data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_5b2c_${msg.id}`}>
                      <div
                        className={cn(
                          'max-w-[80%] rounded-lg p-4',
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground',
                        )}
                        data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_ddad_${msg.id}`}>
                        <p
                          className="whitespace-pre-wrap"
                          data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_e9fe_${msg.id}`}>{msg.content}</p>
                        <span
                          className={cn(
                            'mt-2 block text-xs',
                            msg.role === 'user'
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground',
                          )}
                          data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_5f99_${msg.id}`}>
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isSending && (
                    <div
                      className="flex justify-start"
                      data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_019d">
                      <div
                        className="rounded-lg bg-muted p-4"
                        data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_9319">
                        <Spinner size="sm" data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_96ba" />
                      </div>
                    </div>
                  )}
                  <div
                    ref={messagesEndRef}
                    data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_897d" />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div
              className="border-t border-border p-4"
              data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_4aa7">
              <div
                className="flex gap-2"
                data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_bdaf">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={isSending}
                  data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_d9ff" />
                <Button
                  variant="primary"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isSending}
                  loading={isSending}
                  data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_b731">
                  <Send
                    className="h-4 w-4"
                    data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_3077" />
                </Button>
              </div>
              <p
                className="mt-2 text-xs text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_4c64">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </Card>
        )}

        {/* AI Tools Tab */}
        {activeTab === 'tools' && (
          <div
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
            data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_d454">
            {AI_TOOLS.map((tool) => (
              <Link
                key={tool.id}
                to={`/tools/${tool.slug}`}
                data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_bb6c_${tool.id}`}>
                <Card
                  className="group h-full cursor-pointer transition-all hover:border-primary hover:shadow-md"
                  data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_d885_${tool.id}`}>
                  <div
                    className="flex h-full flex-col p-4"
                    data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_9ce4_${tool.id}`}>
                    <div
                      className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_55a0_${tool.id}`}>
                      <tool.icon className="h-6 w-6" />
                    </div>
                    <h3
                      className="mb-1 font-semibold text-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_d500_${tool.id}`}>{tool.name}</h3>
                    <p
                      className="mb-3 flex-1 text-sm text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_14b1_${tool.id}`}>{tool.description}</p>
                    <div
                      className="flex items-center justify-between"
                      data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_33ba_${tool.id}`}>
                      <Badge
                        variant="category"
                        data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_23d7_${tool.id}`}>{tool.category}</Badge>
                      <span
                        className="text-xs text-muted-foreground group-hover:text-primary"
                        data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_a3e6_${tool.id}`}>
                        Open Tool →
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Provider Management Tab */}
        {activeTab === 'providers' && (
          <div
            className="space-y-6"
            data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_providers_panel">
            {/* Recommendation Banner */}
            {diagnosticData?.recommendation && (
              <Card
                className="border-primary/30 bg-primary/5 p-4"
                data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_recommendation">
                <div
                  className="flex items-start gap-3"
                  data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_6344">
                  <Sparkles
                    className="mt-0.5 h-5 w-5 text-primary"
                    data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_bb13" />
                  <div data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_977a">
                    <h3
                      className="font-semibold text-foreground"
                      data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_381a">Recommended Provider</h3>
                    <p
                      className="text-sm text-muted-foreground"
                      data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_0212">
                      Based on your configured API keys, we recommend{' '}
                      <strong
                        className="text-foreground"
                        data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_43bf">{diagnosticData.recommendation.provider}</strong>{' '}
                      with model{' '}
                      <code
                        className="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono text-foreground"
                        data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_ddb1">
                        {diagnosticData.recommendation.model}
                      </code>
                    </p>
                    <p
                      className="mt-1 text-xs text-muted-foreground"
                      data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_824c">{diagnosticData.recommendation.reason}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Env Provider Status Grid */}
            {diagnosticData?.envProviders && (
              <Card
                className="p-6"
                data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_env_providers">
                <h2
                  className="mb-4 text-lg font-semibold text-foreground"
                  data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_408f">Environment Provider Keys</h2>
                <p
                  className="mb-4 text-sm text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_6c68">
                  API keys detected in your environment configuration
                </p>
                <div
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
                  data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_7a96">
                  {diagnosticData.envProviders.map((ep) => (
                    <div
                      key={ep.provider}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border p-3',
                        ep.hasKey ? 'border-success/30 bg-success/5' : 'border-border bg-background',
                      )}
                      data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_env_${ep.provider}`}>
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                          ep.hasKey ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground',
                        )}
                        data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_2ce0_${ep.provider}`}>
                        {ep.hasKey ? '\u2713' : '\u2717'}
                      </div>
                      <div
                        className="flex-1 min-w-0"
                        data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_5250_${ep.provider}`}>
                        <div
                          className="flex items-center gap-2"
                          data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_739c_${ep.provider}`}>
                          <span
                            className="font-medium capitalize text-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_8b45_${ep.provider}`}>{ep.provider}</span>
                          {ep.isFreeTierFriendly && (
                            <Badge
                              variant="free"
                              className="text-[10px]"
                              data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_00ac_${ep.provider}`}>Free Tier</Badge>
                          )}
                        </div>
                        <p
                          className="truncate text-xs text-muted-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_50fb_${ep.provider}`}>
                          {ep.hasKey ? ep.keyEnvVar : 'Not configured'}
                        </p>
                        <p
                          className="truncate font-mono text-[10px] text-muted-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_7f96_${ep.provider}`}>
                          Model: {ep.defaultModel}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* DB Providers List */}
            <Card
              className="p-6"
              data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_c9d6">
              <div
                className="mb-6 flex items-center justify-between"
                data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_d914">
                <div data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_ae74">
                  <h2
                    className="text-lg font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_5c31">Database Provider Configurations</h2>
                  <p
                    className="text-sm text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_d4de">
                    Providers stored in database with encrypted API keys
                  </p>
                </div>
                <div
                  className="flex gap-2"
                  data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_e003">
                  <Button
                    variant="outline"
                    onClick={runFullDiagnostic}
                    loading={diagnosticLoading}
                    data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_run_diag">
                    <AlertCircle
                      className="mr-2 h-4 w-4"
                      data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_8e51" />
                    Run Diagnostic
                  </Button>
                  <Button
                    variant="outline"
                    onClick={loadProviders}
                    loading={providersLoading}
                    data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_b283">
                    Refresh
                  </Button>
                </div>
              </div>

              {providersError && (
                <Alert
                  variant="error"
                  className="mb-4"
                  data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_616c">
                  {providersError}
                </Alert>
              )}

              {/* Diagnostic Summary */}
              {diagnosticData && (
                <div
                  className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4"
                  data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_3636">
                  <div
                    className="rounded-lg border border-border bg-background p-3 text-center"
                    data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_59e1">
                    <div
                      className="text-2xl font-bold text-success"
                      data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_92d4">{diagnosticData.summary.passed}</div>
                    <div
                      className="text-xs text-muted-foreground"
                      data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_5fb8">Passed</div>
                  </div>
                  <div
                    className="rounded-lg border border-border bg-background p-3 text-center"
                    data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_f6eb">
                    <div
                      className="text-2xl font-bold text-destructive"
                      data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_a56b">{diagnosticData.summary.failed}</div>
                    <div
                      className="text-xs text-muted-foreground"
                      data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_7b2e">Failed</div>
                  </div>
                  <div
                    className="rounded-lg border border-border bg-background p-3 text-center"
                    data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_443c">
                    <div
                      className="text-2xl font-bold text-warning"
                      data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_d8bd">{diagnosticData.summary.notConfigured}</div>
                    <div
                      className="text-xs text-muted-foreground"
                      data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_9f9f">Not Configured</div>
                  </div>
                  <div
                    className="rounded-lg border border-border bg-background p-3 text-center"
                    data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_b247">
                    <div
                      className="text-2xl font-bold text-foreground"
                      data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_66ad">{diagnosticData.summary.total}</div>
                    <div
                      className="text-xs text-muted-foreground"
                      data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_d392">Total Tests</div>
                  </div>
                </div>
              )}

              {/* Database Issues */}
              {diagnosticData?.databaseIssues && diagnosticData.databaseIssues.length > 0 && (
                <Alert
                  variant="warning"
                  className="mb-4"
                  data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_19b7">
                  <div data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_8f01">
                    <strong data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_e850">Database Issues:</strong>
                    <ul
                      className="mt-1 list-inside list-disc text-sm"
                      data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_4e63">
                      {diagnosticData.databaseIssues.map((issue, i) => (
                        <li
                          key={i}
                          data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_8ecf_${i}`}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                </Alert>
              )}

              {providersLoading && !providersError ? (
                <div
                  className="flex justify-center py-12"
                  data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_8aa8">
                  <Spinner size="lg" data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_be7a" />
                </div>
              ) : providers.length === 0 ? (
                <EmptyState
                  icon={Settings}
                  title="No Providers Configured"
                  description="Add AI providers in Settings to enable AI features."
                  action={
                    <Link
                      to="/dashboard/settings"
                      data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_7bac">
                      <Button
                        variant="primary"
                        data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_09e2">Go to Settings</Button>
                    </Link>
                  }
                  data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_b2cc" />
              ) : (
                <div
                  className="space-y-3"
                  data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_fda7">
                  {providers.map((provider) => (
                    <div
                      key={provider._id}
                      className="flex items-center justify-between rounded-lg border border-border bg-background p-4"
                      data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_7f0c_${provider._id}`}>
                      <div
                        className="flex items-center gap-4"
                        data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_48a2_${provider._id}`}>
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-full',
                            provider.isEnabled ? 'bg-success/10' : 'bg-muted',
                          )}
                          data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_dad4_${provider._id}`}>
                          {getStatusIcon(provider.lastTestResult)}
                        </div>
                        <div
                          data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_f784_${provider._id}`}>
                          <div
                            className="flex items-center gap-2"
                            data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_f671_${provider._id}`}>
                            <span
                              className="font-medium capitalize text-foreground"
                              data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_154e_${provider._id}`}>
                              {provider.provider}
                            </span>
                            {provider.isPrimary && (
                              <Badge
                                variant="ai"
                                data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_83f7_${provider._id}`}>Primary</Badge>
                            )}
                            {!provider.isEnabled && (
                              <Badge
                                variant="default"
                                data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_ce11_${provider._id}`}>Disabled</Badge>
                            )}
                          </div>
                          <p
                            className="text-sm text-muted-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_f31f_${provider._id}`}>{provider.modelName}</p>
                          {provider.keyPreview && (
                            <p
                              className="mt-1 font-mono text-xs text-muted-foreground"
                              data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_c087_${provider._id}`}>
                              Key: {provider.keyPreview}
                            </p>
                          )}
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-3"
                        data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_be48_${provider._id}`}>
                        {provider.lastTestResult && (
                          <div
                            className="text-right"
                            data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_fd59_${provider._id}`}>
                            <Badge
                              variant={getStatusBadgeVariant(provider.lastTestResult)}
                              data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_bdf9_${provider._id}`}>
                              {provider.lastTestResult.replace('_', ' ')}
                            </Badge>
                            {provider.lastTestedAt && (
                              <p
                                className="mt-1 text-xs text-muted-foreground"
                                data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_33af_${provider._id}`}>
                                Last tested: {new Date(provider.lastTestedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestConnection(provider._id)}
                          loading={testingProviderId === provider._id}
                          disabled={!provider.isEnabled}
                          data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_test_${provider._id}`}>
                          Test
                        </Button>
                        {provider.lastTestError && (
                          <div
                            className="max-w-[200px] truncate text-xs text-destructive"
                            title={provider.lastTestError}
                            data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_4411_${provider._id}`}>
                            {provider.lastTestError}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Diagnostic Results Detail */}
            {diagnosticData && diagnosticData.results.length > 0 && (
              <Card
                className="p-6"
                data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_diag_results">
                <h2
                  className="mb-4 text-lg font-semibold text-foreground"
                  data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_2454">Diagnostic Test Results</h2>
                <div
                  className="space-y-2"
                  data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_737a">
                  {diagnosticData.results.map((result, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'flex items-center justify-between rounded-lg border p-3',
                        result.status === 'PASS' ? 'border-success/30 bg-success/5' :
                        result.status === 'FAIL' ? 'border-destructive/30 bg-destructive/5' :
                        'border-border bg-background',
                      )}
                      data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_8620_${idx}`}>
                      <div
                        className="flex items-center gap-3"
                        data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_cfb9_${idx}`}>
                        {result.status === 'PASS' ? (
                          <CheckCircle2
                            className="h-4 w-4 text-success"
                            data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_6948_${idx}`} />
                        ) : result.status === 'FAIL' ? (
                          <XCircle
                            className="h-4 w-4 text-destructive"
                            data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_92cd_${idx}`} />
                        ) : (
                          <Clock
                            className="h-4 w-4 text-muted-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_414c_${idx}`} />
                        )}
                        <span
                          className="text-sm font-medium text-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_d88f_${idx}`}>{result.component}</span>
                      </div>
                      <div
                        className="text-right"
                        data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_66f6_${idx}`}>
                        <p
                          className="text-xs text-muted-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_304b_${idx}`}>{result.evidence}</p>
                        {result.latency && (
                          <p
                            className="text-[10px] text-muted-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_dc02_${idx}`}>{(result.latency / 1000).toFixed(1)}s</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Prompt Library Tab */}
        {activeTab === 'prompts' && (
          <div
            className="space-y-4"
            data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_5e07">
            {/* Filters & Actions */}
            <div
              className="flex flex-wrap items-center justify-between gap-4"
              data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_b6f5">
              <div
                className="flex flex-wrap gap-2"
                data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_c33f">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                    selectedCategory === 'All'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                  data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_8271">
                  All
                </button>
                {PROMPT_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                      selectedCategory === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                    data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_de5d_${cat}`}>
                    {cat}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => setShowSaveModal(true)}
                data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_7219">
                <Plus
                  className="mr-2 h-4 w-4"
                  data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_1131" />
                Save Custom Prompt
              </Button>
            </div>

            {/* Prompts Grid */}
            {filteredPrompts.length === 0 ? (
              <Card
                className="py-12"
                data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_d659">
              <EmptyState
                icon={BookOpen}
                title="No Prompts Found"
                description={
                  selectedCategory === 'All'
                    ? 'Start by saving some custom prompts.'
                    : `No prompts in the ${selectedCategory} category.`
                }
                data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_cc81" />
              </Card>
            ) : (
              <div
                className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_9247">
                {filteredPrompts.map((prompt) => (
                  <Card
                    key={prompt.id}
                    className="flex flex-col p-4"
                    data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_a21f_${prompt.id}`}>
                    <div
                      className="mb-3 flex items-start justify-between"
                      data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_f219_${prompt.id}`}>
                      <div
                        className="flex items-center gap-2"
                        data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_17d9_${prompt.id}`}>
                        <Tag
                          className="h-4 w-4 text-primary"
                          data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_bf8b_${prompt.id}`} />
                        <Badge
                          variant="category"
                          data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_5a3d_${prompt.id}`}>{prompt.category}</Badge>
                      </div>
                      {prompt.id.startsWith('custom-') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deletePrompt(prompt.id)}
                          aria-label="Delete prompt"
                          data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_dcb6_${prompt.id}`}>
                          <Trash2
                            className="h-4 w-4 text-destructive"
                            data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_6691_${prompt.id}`} />
                        </Button>
                      )}
                    </div>
                    <h3
                      className="mb-2 font-semibold text-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_e1bf_${prompt.id}`}>{prompt.title}</h3>
                    <p
                      className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-3"
                      data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_35d8_${prompt.id}`}>
                      {prompt.content}
                    </p>
                    {prompt.variables.length > 0 && (
                      <div
                        className="mb-4 flex flex-wrap gap-1"
                        data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_cce8_${prompt.id}`}>
                        {prompt.variables.map((v) => (
                          <span
                            key={v}
                            className="rounded bg-accent px-2 py-0.5 text-xs text-accent-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_9f16_${prompt.id}_${v}`}>
                            {`{{${v}}}`}
                          </span>
                        ))}
                      </div>
                    )}
                    <div
                      className="mt-auto flex gap-2"
                      data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_623a_${prompt.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => copyToClipboard(prompt.content)}
                        data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_7f62_${prompt.id}`}>
                        <Copy
                          className="mr-2 h-3 w-3"
                          data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_1816_${prompt.id}`} />
                        Copy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setActiveTab('assistant');
                          setInputValue(prompt.content);
                        }}
                        data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_2a22_${prompt.id}`}>
                        Use in Chat
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Save Prompt Modal */}
      <Modal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Save Custom Prompt"
        footer={
          <div
            className="flex justify-end gap-2"
            data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_89c4">
            <Button
              variant="outline"
              onClick={() => setShowSaveModal(false)}
              data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_7f56">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={saveCustomPrompt}
              data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_280d">
              Save Prompt
            </Button>
          </div>
        }
        data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_4033">
        <div
          className="space-y-4"
          data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_e147">
          <Field
            label="Title"
            required
            data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_692c">
            <Input
              value={newPromptTitle}
              onChange={(e) => setNewPromptTitle(e.target.value)}
              placeholder="Enter prompt title"
              data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_83a0" />
          </Field>
          <Field
            label="Category"
            required
            data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_9bb6">
            <select
              value={newPromptCategory}
              onChange={(e) => setNewPromptCategory(e.target.value as PromptCategory)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_9881">
              {PROMPT_CATEGORIES.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                  data-icod-id={`src_pages_dashboard_dashboardaicenter_tsx_f6d0_${cat}`}>
                  {cat}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Prompt Content"
            required
            data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_b675">
            <textarea
              value={newPromptContent}
              onChange={(e) => setNewPromptContent(e.target.value)}
              placeholder="Enter your prompt template. Use {{variable}} for placeholders."
              rows={5}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_ef31" />
          </Field>
          <p
            className="text-xs text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardaicenter_tsx_91ff">
            Tip: Use {'{{variable_name}}'} syntax for dynamic placeholders that users can fill in.
          </p>
        </div>
      </Modal>
    </div>
  );
}
