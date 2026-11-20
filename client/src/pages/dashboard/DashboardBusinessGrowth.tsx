import { useState, useEffect } from 'react';
import {
  Rocket,
  Target,
  Calendar,
  Trophy,
  Users,
  Lightbulb,
  CheckCircle,
  TrendingUp,
  ChevronRight,
  AlertCircle,
  BarChart3,
  FileText,
  Globe,
  Shield,
  Settings,
  Search,
  DollarSign,
  Mail,
  Instagram,
  Linkedin,
  Youtube,
} from 'lucide-react';
import { Button, Card, Badge, Input, Spinner, Alert, Field } from '@/components/ui';
import { cn } from '@/utils/cn';
import { aiService } from '@/services/aiService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { extractErrorMessage } from '@/utils/errorHandler';

// ─── Types ──────────────────────────────────────────────────────────────────────

type TabId = 'readiness' | 'marketing' | 'content' | 'roadmap' | 'competitor';

interface ReadinessQuestion {
  id: string;
  category: string;
  question: string;
  answer: 'yes' | 'no' | 'partial' | null;
}

interface ReadinessCategory {
  name: string;
  icon: React.ElementType;
  questions: ReadinessQuestion[];
}

interface MarketingFormData {
  businessType: string;
  targetAudience: string;
  budgetRange: string;
  goals: string;
  industry: string;
}

interface ContentPlanData {
  platform: string;
  niche: string;
  frequency: string;
  duration: number;
}

interface RoadmapTask {
  id: string;
  week: number;
  day: number;
  title: string;
  description: string;
  completed: boolean;
}

interface CompetitorData {
  url: string;
  analysis: string | null;
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const READINESS_CATEGORIES: Omit<ReadinessCategory, 'questions'>[] = [
  { name: 'Market Validation', icon: Target },
  { name: 'Financial Planning', icon: DollarSign },
  { name: 'Digital Presence', icon: Globe },
  { name: 'Legal Compliance', icon: Shield },
  { name: 'Operations', icon: Settings },
];

const READINESS_QUESTIONS: Record<string, string[]> = {
  'Market Validation': [
    'Have you identified your target customer persona?',
    'Have you validated that customers will pay for your product/service?',
    'Do you understand your market size and growth potential?',
    'Have you analyzed your main competitors?',
    'Do you have a unique value proposition?',
  ],
  'Financial Planning': [
    'Do you have a detailed business plan with financial projections?',
    'Have you calculated your startup costs?',
    'Do you have at least 6 months of operating capital?',
    'Have you identified funding sources if needed?',
    'Do you have a pricing strategy based on market research?',
  ],
  'Digital Presence': [
    'Do you have a professional website or landing page?',
    'Have you set up social media profiles for your business?',
    'Do you have an email marketing system in place?',
    'Have you implemented basic SEO on your website?',
    'Do you have analytics tracking set up?',
  ],
  'Legal Compliance': [
    'Have you registered your business legally?',
    'Do you have necessary licenses and permits?',
    'Have you obtained appropriate business insurance?',
    'Do you have terms of service and privacy policy?',
    'Have you protected your intellectual property (trademarks, etc.)?',
  ],
  'Operations': [
    'Do you have reliable suppliers/vendors lined up?',
    'Have you documented your core business processes?',
    'Do you have a customer service plan?',
    'Have you set up accounting/bookkeeping systems?',
    'Do you have a team or outsourcing plan?',
  ],
};

const PLATFORMS = [
  { id: 'blog', name: 'Blog', icon: FileText },
  { id: 'social', name: 'Social Media', icon: Instagram },
  { id: 'email', name: 'Email Newsletter', icon: Mail },
  { id: 'youtube', name: 'YouTube', icon: Youtube },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
];

const BUDGET_RANGES = [
  '$0 - $500/month',
  '$500 - $2,000/month',
  '$2,000 - $5,000/month',
  '$5,000 - $10,000/month',
  '$10,000+/month',
];

// ─── Helper Functions ───────────────────────────────────────────────────────────

function getReadinessQuestions(): ReadinessQuestion[] {
  const questions: ReadinessQuestion[] = [];
  Object.entries(READINESS_QUESTIONS).forEach(([category, qs]) => {
    qs.forEach((question, index) => {
      questions.push({
        id: `${category}-${index}`,
        category,
        question,
        answer: null,
      });
    });
  });
  return questions;
}

function calculateReadinessScore(questions: ReadinessQuestion[]): {
  overall: number;
  byCategory: Record<string, number>;
} {
  const byCategory: Record<string, { yes: number; partial: number; total: number }> = {};

  questions.forEach((q) => {
    if (!byCategory[q.category]) {
      byCategory[q.category] = { yes: 0, partial: 0, total: 0 };
    }
    byCategory[q.category].total += 1;
    if (q.answer === 'yes') byCategory[q.category].yes += 1;
    if (q.answer === 'partial') byCategory[q.category].partial += 1;
  });

  const categoryScores: Record<string, number> = {};
  let totalScore = 0;
  let totalWeight = 0;

  Object.entries(byCategory).forEach(([cat, data]) => {
    const score = ((data.yes * 1 + data.partial * 0.5) / data.total) * 100;
    categoryScores[cat] = Math.round(score);
    totalScore += score;
    totalWeight += 1;
  });

  return {
    overall: totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0,
    byCategory: categoryScores,
  };
}

function generateInitialRoadmap(): RoadmapTask[] {
  const tasks: RoadmapTask[] = [];
  const roadmapItems = [
    { week: 1, day: 1, title: 'Define Business Idea', description: 'Write down your business concept and value proposition' },
    { week: 1, day: 2, title: 'Market Research', description: 'Research your target market and competitors' },
    { week: 1, day: 3, title: 'Create Business Plan', description: 'Draft a lean business plan with key metrics' },
    { week: 1, day: 4, title: 'Validate Idea', description: 'Talk to 5 potential customers about your idea' },
    { week: 1, day: 5, title: 'Set Up Finances', description: 'Open business bank account and set up bookkeeping' },
    { week: 1, day: 6, title: 'Legal Setup', description: 'Register business and obtain necessary licenses' },
    { week: 1, day: 7, title: 'Week 1 Review', description: 'Review progress and adjust plans for Week 2' },
    { week: 2, day: 8, title: 'Build MVP', description: 'Create minimum viable product or service offering' },
    { week: 2, day: 9, title: 'Set Up Website', description: 'Create basic website or landing page' },
    { week: 2, day: 10, title: 'Social Media Setup', description: 'Create business profiles on relevant platforms' },
    { week: 2, day: 11, title: 'Content Strategy', description: 'Plan your content marketing approach' },
    { week: 2, day: 12, title: 'Email List Setup', description: 'Set up email marketing platform and lead magnet' },
    { week: 2, day: 13, title: 'Pricing Finalization', description: 'Finalize pricing based on market research' },
    { week: 2, day: 14, title: 'Week 2 Review', description: 'Test MVP with early adopters and gather feedback' },
    { week: 3, day: 15, title: 'Launch Preparation', description: 'Prepare launch materials and announcements' },
    { week: 3, day: 16, title: 'Beta Testing', description: 'Run beta test with selected users' },
    { week: 3, day: 17, title: 'Fix Issues', description: 'Address feedback and fix critical issues' },
    { week: 3, day: 18, title: 'Marketing Assets', description: 'Create promotional graphics and copy' },
    { week: 3, day: 19, title: 'Pre-Launch Buzz', description: 'Start teasing launch on social media' },
    { week: 3, day: 20, title: 'Partner Outreach', description: 'Reach out to potential partners and affiliates' },
    { week: 3, day: 21, title: 'Week 3 Review', description: 'Final preparations for public launch' },
    { week: 4, day: 22, title: 'Soft Launch', description: 'Launch to email list and close network' },
    { week: 4, day: 23, title: 'Public Launch', description: 'Announce publicly on all channels' },
    { week: 4, day: 24, title: 'Monitor Metrics', description: 'Track signups, sales, and user feedback' },
    { week: 4, day: 25, title: 'Customer Support', description: 'Respond to inquiries and support requests' },
    { week: 4, day: 26, title: 'Content Creation', description: 'Create post-launch content and case studies' },
    { week: 4, day: 27, title: 'Optimize Conversion', description: 'A/B test landing pages and offers' },
    { week: 4, day: 28, title: 'Scale Planning', description: 'Plan growth strategies for month 2 and beyond' },
    { week: 4, day: 29, title: 'Month 1 Review', description: 'Analyze results and document learnings' },
    { week: 4, day: 30, title: 'Set Month 2 Goals', description: 'Set SMART goals for next 30 days' },
  ];

  roadmapItems.forEach((item, index) => {
    tasks.push({
      id: `task-${index}`,
      week: item.week,
      day: item.day,
      title: item.title,
      description: item.description,
      completed: false,
    });
  });

  return tasks;
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function DashboardBusinessGrowth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const [activeTab, setActiveTab] = useState<TabId>('readiness');

  // Readiness state
  const [readinessQuestions, setReadinessQuestions] = useState<ReadinessQuestion[]>(getReadinessQuestions());

  // Marketing plan state
  const [marketingForm, setMarketingForm] = useState<MarketingFormData>({
    businessType: '',
    targetAudience: '',
    budgetRange: '',
    goals: '',
    industry: '',
  });
  const [marketingPlan, setMarketingPlan] = useState<string | null>(null);
  const [isGeneratingMarketing, setIsGeneratingMarketing] = useState(false);
  const [marketingError, setMarketingError] = useState<string | null>(null);

  // Content plan state
  const [contentData, setContentData] = useState<ContentPlanData>({
    platform: 'blog',
    niche: '',
    frequency: 'weekly',
    duration: 30,
  });
  const [contentPlan, setContentPlan] = useState<string | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  // Roadmap state
  const [roadmapTasks, setRoadmapTasks] = useState<RoadmapTask[]>([]);
  const [roadmapLoaded, setRoadmapLoaded] = useState(false);

  // Competitor state
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [competitorAnalysis, setCompetitorAnalysis] = useState<CompetitorData[]>([]);
  const [isAnalyzingCompetitor, setIsAnalyzingCompetitor] = useState(false);
  const [competitorError, setCompetitorError] = useState<string | null>(null);

  // Load roadmap from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('businessGrowth_roadmap');
    if (stored) {
      try {
        setRoadmapTasks(JSON.parse(stored));
      } catch {
        setRoadmapTasks(generateInitialRoadmap());
      }
    } else {
      setRoadmapTasks(generateInitialRoadmap());
    }
    setRoadmapLoaded(true);
  }, []);

  // Save roadmap to localStorage when it changes
  useEffect(() => {
    if (roadmapLoaded && roadmapTasks.length > 0) {
      localStorage.setItem('businessGrowth_roadmap', JSON.stringify(roadmapTasks));
    }
  }, [roadmapTasks, roadmapLoaded]);

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'readiness', label: 'Business Readiness', icon: Trophy },
    { id: 'marketing', label: 'Marketing Plan', icon: Target },
    { id: 'content', label: 'Content Calendar', icon: Calendar },
    { id: 'roadmap', label: '30-Day Roadmap', icon: Rocket },
    { id: 'competitor', label: 'Competitor Intel', icon: Users },
  ];

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleReadinessAnswer = (questionId: string, answer: 'yes' | 'no' | 'partial') => {
    setReadinessQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, answer } : q))
    );
  };

  const handleGenerateMarketingPlan = async () => {
    if (!marketingForm.businessType || !marketingForm.targetAudience || !marketingForm.goals) {
      setMarketingError('Please fill in business type, target audience, and goals.');
      return;
    }

    setIsGeneratingMarketing(true);
    setMarketingError(null);
    setMarketingPlan(null);

    try {
      const prompt = `Create a comprehensive marketing plan for the following business:

Business Type: ${marketingForm.businessType}
Industry: ${marketingForm.industry || 'Not specified'}
Target Audience: ${marketingForm.targetAudience}
Budget Range: ${marketingForm.budgetRange || 'Not specified'}
Goals: ${marketingForm.goals}

Please provide a structured marketing plan with the following sections:
1. Executive Summary
2. Target Audience Analysis
3. Marketing Channels & Strategies
4. Budget Allocation Recommendations
5. Content Strategy
6. Key Performance Indicators (KPIs)
7. Timeline & Milestones
8. Risk Assessment

Format each section clearly with headers and bullet points where appropriate.`;

      const response = await aiService.chat(prompt, 'You are an expert marketing strategist. Provide detailed, actionable marketing plans.');

      if (response.success && response.data?.response) {
        setMarketingPlan(response.data.response);
      } else {
        setMarketingError('Failed to generate marketing plan. Please try again.');
      }
    } catch (err) {
      setMarketingError(extractErrorMessage(err, 'An error occurred while generating the marketing plan.'));
    } finally {
      setIsGeneratingMarketing(false);
    }
  };

  const handleGenerateContentPlan = async () => {
    if (!contentData.niche) {
      setContentError('Please specify your niche/topic area.');
      return;
    }

    setIsGeneratingContent(true);
    setContentError(null);
    setContentPlan(null);

    try {
      const prompt = `Create a ${contentData.duration}-day content calendar for ${contentData.platform} in the ${contentData.niche} niche.

Posting Frequency: ${contentData.frequency}

Please provide:
1. A brief content strategy overview
2. Content pillars/themes (3-5 main topics)
3. A day-by-day or week-by-week content schedule with:
   - Content title/topic
   - Content format (article, video, carousel, etc.)
   - Brief description of what to cover
   - Suggested posting time (if applicable)
4. Hashtag or keyword suggestions
5. Engagement tactics

Make the plan practical and actionable. Include specific content ideas, not just generic categories.`;

      const response = await aiService.chat(prompt, 'You are a content marketing expert specializing in content calendars and social media strategy.');

      if (response.success && response.data?.response) {
        setContentPlan(response.data.response);
      } else {
        setContentError('Failed to generate content plan. Please try again.');
      }
    } catch (err) {
      setContentError(extractErrorMessage(err, 'An error occurred while generating the content plan.'));
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleToggleRoadmapTask = (taskId: string) => {
    setRoadmapTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleResetRoadmap = () => {
    if (confirm('Are you sure you want to reset all progress?')) {
      setRoadmapTasks(generateInitialRoadmap());
    }
  };

  const handleAnalyzeCompetitor = async () => {
    if (!competitorUrl.trim()) {
      setCompetitorError('Please enter a competitor URL.');
      return;
    }

    setIsAnalyzingCompetitor(true);
    setCompetitorError(null);

    try {
      const prompt = `Analyze the following competitor website and provide a SWOT analysis:

URL: ${competitorUrl}

Please provide:
1. **Strengths** - What they do well, their competitive advantages
2. **Weaknesses** - Areas where they appear vulnerable or lacking
3. **Opportunities** - Market gaps or trends they could exploit (or that you could exploit against them)
4. **Threats** - External factors that could impact them (and potentially you)

Also include:
- Their apparent target audience
- Key features/products/services they offer
- Pricing strategy (if visible)
- Marketing channels they appear to use
- Actionable insights for how to compete against them

Base your analysis on typical patterns for businesses in this space. Note any limitations of analyzing just from a URL.`;

      const response = await aiService.chat(prompt, 'You are a competitive intelligence analyst. Provide strategic, actionable competitive analysis.');

      if (response.success && response.data?.response) {
        setCompetitorAnalysis((prev) => [
          ...prev,
          { url: competitorUrl, analysis: response.data.response },
        ]);
        setCompetitorUrl('');
      } else {
        setCompetitorError('Failed to analyze competitor. Please try again.');
      }
    } catch (err) {
      setCompetitorError('An error occurred while analyzing the competitor.');
    } finally {
      setIsAnalyzingCompetitor(false);
    }
  };

  const handleRemoveCompetitorAnalysis = (index: number) => {
    setCompetitorAnalysis((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Render Helpers ─────────────────────────────────────────────────────────

  const readinessScores = calculateReadinessScore(readinessQuestions);
  const answeredCount = readinessQuestions.filter((q) => q.answer !== null).length;
  const totalCount = readinessQuestions.length;
  const progressPercent = Math.round((answeredCount / totalCount) * 100);

  const roadmapProgress = Math.round(
    (roadmapTasks.filter((t) => t.completed).length / roadmapTasks.length) * 100
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="space-y-6"
      data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_e5e5">
      {/* Header */}
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_63aa">
        <div data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_9f8c">
          <h1
            className="text-2xl font-bold text-foreground"
            data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_052c">Business Growth</h1>
          <p
            className="text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_8130">
            Tools to assess, plan, and grow your online business
          </p>
        </div>
        <Badge
          variant="ai"
          className="px-3 py-1"
          data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_4d6c">
          <TrendingUp
            className="mr-1 h-4 w-4"
            data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_8c16" />
          Growth Suite
        </Badge>
      </div>
      {/* Tabs */}
      <div
        className="border-b border-border"
        data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_47b9">
        <nav
          className="-mb-px flex space-x-8 overflow-x-auto"
          aria-label="Tabs"
          data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_3033">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                )}
                data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_d4e9_${tab.id}`}>
                <Icon
                  className="mr-2 h-4 w-4"
                  data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_5c3e_${tab.id}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
      {/* Tab Content */}
      <div
        className="min-h-[400px]"
        data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_536e">
        {/* ─── Business Readiness Tab ──────────────────────────────────────── */}
        {activeTab === 'readiness' && (
          <div
            className="space-y-6"
            data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_80d0">
            {/* Score Overview */}
            <div
              className="grid gap-4 md:grid-cols-3"
              data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_8896">
              <Card
                className="p-6"
                data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_13d5">
                <div
                  className="flex items-center justify-between"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_0052">
                  <div data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_6fb8">
                    <p
                      className="text-sm text-muted-foreground"
                      data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_72fa">Overall Readiness</p>
                    <p
                      className="text-3xl font-bold text-foreground"
                      data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_2629">{readinessScores.overall}%</p>
                  </div>
                  <div
                    className="rounded-full bg-primary/10 p-3"
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_6601">
                    <Trophy
                      className="h-6 w-6 text-primary"
                      data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_7c76" />
                  </div>
                </div>
                <div
                  className="mt-4 h-2 w-full rounded-full bg-muted"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_e1c8">
                  <div
                    className="h-2 rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${readinessScores.overall}%` }}
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_1d1d" />
                </div>
              </Card>

              <Card
                className="p-6"
                data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_93c4">
                <div
                  className="flex items-center justify-between"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_abac">
                  <div data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_1689">
                    <p
                      className="text-sm text-muted-foreground"
                      data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_78f8">Questions Answered</p>
                    <p
                      className="text-3xl font-bold text-foreground"
                      data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_bb50">
                      {answeredCount}/{totalCount}
                    </p>
                  </div>
                  <div
                    className="rounded-full bg-accent/10 p-3"
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_3c94">
                    <CheckCircle
                      className="h-6 w-6 text-accent"
                      data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_6fc0" />
                  </div>
                </div>
                <div
                  className="mt-4 h-2 w-full rounded-full bg-muted"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_dc21">
                  <div
                    className="h-2 rounded-full bg-accent transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_9904" />
                </div>
              </Card>

              <Card
                className="p-6"
                data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_4299">
                <div
                  className="flex items-center justify-between"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_5c1a">
                  <div data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_2241">
                    <p
                      className="text-sm text-muted-foreground"
                      data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_383f">Categories Assessed</p>
                    <p
                      className="text-3xl font-bold text-foreground"
                      data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_d01f">
                      {Object.keys(readinessScores.byCategory).length}/5
                    </p>
                  </div>
                  <div
                    className="rounded-full bg-secondary/10 p-3"
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_7987">
                    <BarChart3
                      className="h-6 w-6 text-secondary"
                      data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_fedd" />
                  </div>
                </div>
                <p
                  className="mt-4 text-xs text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_d231">
                  Complete all categories for accurate scoring
                </p>
              </Card>
            </div>

            {/* Category Breakdown */}
            <Card
              className="p-6"
              data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_d5ed">
              <h3
                className="mb-4 text-lg font-semibold text-foreground"
                data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_5ad0">Category Breakdown</h3>
              <div
                className="space-y-4"
                data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_21da">
                {READINESS_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const score = readinessScores.byCategory[cat.name] ?? 0;
                  return (
                    <div
                      key={cat.name}
                      className="flex items-center gap-4"
                      data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_c353_${cat.name}`}>
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted"
                        data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_eefb_${cat.name}`}>
                        <Icon
                          className="h-5 w-5 text-muted-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_e94b_${cat.name}`} />
                      </div>
                      <div
                        className="flex-1"
                        data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_75c0_${cat.name}`}>
                        <div
                          className="flex items-center justify-between"
                          data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_fc90_${cat.name}`}>
                          <span
                            className="font-medium text-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_484b_${cat.name}`}>{cat.name}</span>
                          <span
                            className="text-sm font-semibold text-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_e922_${cat.name}`}>{score}%</span>
                        </div>
                        <div
                          className="mt-1 h-2 w-full rounded-full bg-muted"
                          data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_e458_${cat.name}`}>
                          <div
                            className={cn(
                              'h-2 rounded-full transition-all duration-500',
                              score >= 80 ? 'bg-success' : score >= 50 ? 'bg-warning' : 'bg-destructive'
                            )}
                            style={{ width: `${score}%` }}
                            data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_d50d_${cat.name}`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Questions by Category */}
            <div
              className="space-y-6"
              data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_1a30">
              {READINESS_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const categoryQuestions = readinessQuestions.filter((q) => q.category === cat.name);
                const categoryScore = readinessScores.byCategory[cat.name] ?? 0;

                return (
                  <Card
                    key={cat.name}
                    className="overflow-hidden"
                    data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_2258_${cat.name}`}>
                    <div
                      className="flex items-center justify-between border-b border-border bg-muted/50 px-6 py-4"
                      data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_8091_${cat.name}`}>
                      <div
                        className="flex items-center gap-3"
                        data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_7f3d_${cat.name}`}>
                        <div
                          className="rounded-lg bg-primary/10 p-2"
                          data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_c937_${cat.name}`}>
                          <Icon
                            className="h-5 w-5 text-primary"
                            data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_ad38_${cat.name}`} />
                        </div>
                        <div
                          data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_02a0_${cat.name}`}>
                          <h3
                            className="font-semibold text-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_00b8_${cat.name}`}>{cat.name}</h3>
                          <p
                            className="text-sm text-muted-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_28fd_${cat.name}`}>
                            {categoryQuestions.filter((q) => q.answer !== null).length}/
                            {categoryQuestions.length} answered
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="default"
                        className={cn(
                          categoryScore >= 80 ? 'bg-success text-primary-foreground' : categoryScore >= 50 ? 'bg-warning text-primary-foreground' : 'bg-destructive text-primary-foreground'
                        )}
                        data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_67bc_${cat.name}`}>
                        {categoryScore}%
                      </Badge>
                    </div>
                    <div
                      className="divide-y divide-border p-6"
                      data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_2fcd_${cat.name}`}>
                      {categoryQuestions.map((q) => (
                        <div
                          key={q.id}
                          className="py-4 first:pt-0 last:pb-0"
                          data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_9f08_${cat.name}_${q.id}`}>
                          <p
                            className="mb-3 font-medium text-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_813c_${cat.name}_${q.id}`}>{q.question}</p>
                          <div
                            className="flex gap-2"
                            data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_de41_${cat.name}_${q.id}`}>
                            <Button
                              variant={q.answer === 'yes' ? 'primary' : 'outline'}
                              size="sm"
                              onClick={() => handleReadinessAnswer(q.id, 'yes')}
                              data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_e094_${cat.name}_${q.id}`}>
                              Yes
                            </Button>
                            <Button
                              variant={q.answer === 'partial' ? 'secondary' : 'outline'}
                              size="sm"
                              onClick={() => handleReadinessAnswer(q.id, 'partial')}
                              data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_4f3a_${cat.name}_${q.id}`}>
                              Partial
                            </Button>
                            <Button
                              variant={q.answer === 'no' ? 'destructive' : 'outline'}
                              size="sm"
                              onClick={() => handleReadinessAnswer(q.id, 'no')}
                              data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_38a6_${cat.name}_${q.id}`}>
                              No
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Marketing Plan Tab ──────────────────────────────────────────── */}
        {activeTab === 'marketing' && (
          <div
            className="space-y-6"
            data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_9c69">
            <Card
              className="p-6"
              data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_e1bb">
              <div
                className="mb-6 flex items-center gap-3"
                data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_d139">
                <div
                  className="rounded-lg bg-primary/10 p-3"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_3254">
                  <Target
                    className="h-6 w-6 text-primary"
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_e212" />
                </div>
                <div data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_355a">
                  <h2
                    className="text-xl font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_0cd5">AI Marketing Plan Generator</h2>
                  <p
                    className="text-sm text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_391a">
                    Get a comprehensive, customized marketing plan for your business
                  </p>
                </div>
              </div>

              <div
                className="grid gap-4 md:grid-cols-2"
                data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_ea89">
                <Field
                  label="Business Type"
                  required
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_aff5">
                  <Input
                    placeholder="e.g., SaaS, E-commerce, Consulting, Coaching"
                    value={marketingForm.businessType}
                    onChange={(e) =>
                      setMarketingForm((prev) => ({ ...prev, businessType: e.target.value }))
                    }
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_5f5d" />
                </Field>

                <Field
                  label="Industry"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_c4ff">
                  <Input
                    placeholder="e.g., Technology, Healthcare, Finance, Education"
                    value={marketingForm.industry}
                    onChange={(e) =>
                      setMarketingForm((prev) => ({ ...prev, industry: e.target.value }))
                    }
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_fff4" />
                </Field>

                <Field
                  label="Target Audience"
                  required
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_de0f">
                  <Input
                    placeholder="e.g., Small business owners aged 30-50, Tech startups"
                    value={marketingForm.targetAudience}
                    onChange={(e) =>
                      setMarketingForm((prev) => ({ ...prev, targetAudience: e.target.value }))
                    }
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_c3ec" />
                </Field>

                <Field
                  label="Budget Range"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_0fc2">
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    value={marketingForm.budgetRange}
                    onChange={(e) =>
                      setMarketingForm((prev) => ({ ...prev, budgetRange: e.target.value }))
                    }
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_22ef">
                    <option
                      value=""
                      data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_d223">Select budget range</option>
                    {BUDGET_RANGES.map((range) => (
                      <option
                        key={range}
                        value={range}
                        data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_f680_${range}`}>
                        {range}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Marketing Goals"
                  required
                  className="md:col-span-2"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_34bf">
                  <textarea
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    rows={3}
                    placeholder="Describe your main marketing objectives (e.g., increase brand awareness, generate leads, drive sales)"
                    value={marketingForm.goals}
                    onChange={(e) =>
                      setMarketingForm((prev) => ({ ...prev, goals: e.target.value }))
                    }
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_be3f" />
                </Field>
              </div>

              {marketingError && (
                <Alert
                  variant="error"
                  className="mt-4"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_46f5">
                  {marketingError}
                </Alert>
              )}

              <div
                className="mt-6 flex justify-end"
                data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_4317">
                <Button
                  onClick={handleGenerateMarketingPlan}
                  disabled={isGeneratingMarketing}
                  className="min-w-[180px]"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_e8af">
                  {isGeneratingMarketing ? (
                    <>
                      <Spinner
                        size="sm"
                        className="mr-2"
                        data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_27f6" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Lightbulb
                        className="mr-2 h-4 w-4"
                        data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_3be1" />
                      Generate Plan
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {marketingPlan && (
              <Card
                className="p-6"
                data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_799d">
                <div
                  className="mb-4 flex items-center justify-between"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_9b73">
                  <h3
                    className="text-lg font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_4474">Your Marketing Plan</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMarketingPlan(null)}
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_d300">
                    Clear
                  </Button>
                </div>
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_fa83">
                  <pre
                    className="whitespace-pre-wrap font-sans text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_7493">
                    {marketingPlan}
                  </pre>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ─── Content Calendar Tab ────────────────────────────────────────── */}
        {activeTab === 'content' && (
          <div
            className="space-y-6"
            data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_9355">
            <Card
              className="p-6"
              data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_3b2e">
              <div
                className="mb-6 flex items-center gap-3"
                data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_4401">
                <div
                  className="rounded-lg bg-accent/10 p-3"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_d368">
                  <Calendar
                    className="h-6 w-6 text-accent"
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_d7cb" />
                </div>
                <div data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_7bef">
                  <h2
                    className="text-xl font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_9ca5">Content Calendar Generator</h2>
                  <p
                    className="text-sm text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_5a01">
                    Create a structured content plan for your chosen platform
                  </p>
                </div>
              </div>

              <div
                className="grid gap-4 md:grid-cols-2"
                data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_6eb2">
                <Field
                  label="Platform"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_3f45">
                  <div
                    className="grid grid-cols-2 gap-2 sm:grid-cols-3"
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_ed82">
                    {PLATFORMS.map((platform) => {
                      const Icon = platform.icon;
                      const isSelected = contentData.platform === platform.id;
                      return (
                        <button
                          key={platform.id}
                          onClick={() => setContentData((prev) => ({ ...prev, platform: platform.id }))}
                          className={cn(
                            'flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors',
                            isSelected
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                          )}
                          data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_c3f4_${platform.id}`}>
                          <Icon
                            className="h-5 w-5"
                            data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_e809_${platform.id}`} />
                          <span
                            className="text-xs font-medium"
                            data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_4bdc_${platform.id}`}>{platform.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field
                  label="Niche / Topic Area"
                  required
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_e67c">
                  <Input
                    placeholder="e.g., Personal Finance, Fitness, SaaS Marketing"
                    value={contentData.niche}
                    onChange={(e) =>
                      setContentData((prev) => ({ ...prev, niche: e.target.value }))
                    }
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_e41d" />
                </Field>

                <Field
                  label="Posting Frequency"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_0a73">
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    value={contentData.frequency}
                    onChange={(e) =>
                      setContentData((prev) => ({ ...prev, frequency: e.target.value }))
                    }
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_46de">
                    <option
                      value="daily"
                      data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_b600">Daily</option>
                    <option
                      value="3x-week"
                      data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_f71a">3x per week</option>
                    <option
                      value="weekly"
                      data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_3f31">Weekly</option>
                    <option
                      value="biweekly"
                      data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_36f4">Bi-weekly</option>
                  </select>
                </Field>

                <Field
                  label="Duration"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_e364">
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    value={contentData.duration}
                    onChange={(e) =>
                      setContentData((prev) => ({ ...prev, duration: Number(e.target.value) }))
                    }
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_0342">
                    <option
                      value={7}
                      data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_cf22">7 days</option>
                    <option
                      value={14}
                      data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_ccc0">14 days</option>
                    <option
                      value={30}
                      data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_f9bf">30 days</option>
                    <option
                      value={60}
                      data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_f6c8">60 days</option>
                    <option
                      value={90}
                      data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_b178">90 days</option>
                  </select>
                </Field>
              </div>

              {contentError && (
                <Alert
                  variant="error"
                  className="mt-4"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_f3d9">
                  {contentError}
                </Alert>
              )}

              <div
                className="mt-6 flex justify-end"
                data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_47f4">
                <Button
                  onClick={handleGenerateContentPlan}
                  disabled={isGeneratingContent}
                  className="min-w-[180px]"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_9f88">
                  {isGeneratingContent ? (
                    <>
                      <Spinner
                        size="sm"
                        className="mr-2"
                        data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_7429" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Calendar
                        className="mr-2 h-4 w-4"
                        data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_2438" />
                      Generate Calendar
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {contentPlan && (
              <Card
                className="p-6"
                data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_7c2c">
                <div
                  className="mb-4 flex items-center justify-between"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_e272">
                  <h3
                    className="text-lg font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_78af">Your Content Calendar</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setContentPlan(null)}
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_79b9">
                    Clear
                  </Button>
                </div>
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_a662">
                  <pre
                    className="whitespace-pre-wrap font-sans text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_4b3b">
                    {contentPlan}
                  </pre>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ─── 30-Day Roadmap Tab ──────────────────────────────────────────── */}
        {activeTab === 'roadmap' && (
          <div
            className="space-y-6"
            data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_c59f">
            {/* Progress Overview */}
            <Card
              className="p-6"
              data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_e891">
              <div
                className="flex items-center justify-between"
                data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_5ca1">
                <div
                  className="flex items-center gap-3"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_e187">
                  <div
                    className="rounded-lg bg-primary/10 p-3"
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_13eb">
                    <Rocket
                      className="h-6 w-6 text-primary"
                      data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_2d23" />
                  </div>
                  <div data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_5f44">
                    <h2
                      className="text-xl font-semibold text-foreground"
                      data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_8a10">30-Day Launch Roadmap</h2>
                    <p
                      className="text-sm text-muted-foreground"
                      data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_5fad">
                      Track your progress through the business launch journey
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetRoadmap}
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_ce4d">
                  Reset Progress
                </Button>
              </div>

              <div
                className="mt-6"
                data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_996d">
                <div
                  className="flex items-center justify-between text-sm"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_31da">
                  <span
                    className="text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_b614">Overall Progress</span>
                  <span
                    className="font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_c131">{roadmapProgress}%</span>
                </div>
                <div
                  className="mt-2 h-3 w-full rounded-full bg-muted"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_01e6">
                  <div
                    className="h-3 rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${roadmapProgress}%` }}
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_67c2" />
                </div>
                <p
                  className="mt-2 text-xs text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_4979">
                  {roadmapTasks.filter((t) => t.completed).length} of {roadmapTasks.length} tasks completed
                </p>
              </div>
            </Card>

            {/* Week Sections */}
            {[1, 2, 3, 4].map((week) => {
              const weekTasks = roadmapTasks.filter((t) => t.week === week);
              const weekCompleted = weekTasks.filter((t) => t.completed).length;
              const weekProgress = Math.round((weekCompleted / weekTasks.length) * 100);

              return (
                <Card
                  key={week}
                  className="overflow-hidden"
                  data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_a70d_${week}`}>
                  <div
                    className="flex items-center justify-between border-b border-border bg-muted/50 px-6 py-4"
                    data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_d6aa_${week}`}>
                    <div
                      className="flex items-center gap-3"
                      data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_fb50_${week}`}>
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_cf67_${week}`}>
                        {week}
                      </div>
                      <div
                        data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_7c81_${week}`}>
                        <h3
                          className="font-semibold text-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_630c_${week}`}>Week {week}</h3>
                        <p
                          className="text-sm text-muted-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_0355_${week}`}>
                          Days {(week - 1) * 7 + 1}-{week * 7}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="default"
                      className={cn(weekProgress === 100 ? 'bg-success text-primary-foreground' : '')}
                      data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_def2_${week}`}>
                      {weekProgress}%
                    </Badge>
                  </div>
                  <div
                    className="divide-y divide-border"
                    data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_9700_${week}`}>
                    {weekTasks.map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          'flex items-start gap-4 px-6 py-4 transition-colors',
                          task.completed ? 'bg-success/5' : ''
                        )}
                        data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_5705_${week}_${task.id}`}>
                        <button
                          onClick={() => handleToggleRoadmapTask(task.id)}
                          className={cn(
                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                            task.completed
                              ? 'border-success bg-success text-primary-foreground'
                              : 'border-border bg-background hover:border-primary'
                          )}
                          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                          data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_dad2_${week}_${task.id}`}>
                          {task.completed && <CheckCircle
                            className="h-3.5 w-3.5"
                            data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_6b3f_${week}_${task.id}`} />}
                        </button>
                        <div
                          className="flex-1"
                          data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_e041_${week}_${task.id}`}>
                          <div
                            className="flex items-center gap-2"
                            data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_4e8e_${week}_${task.id}`}>
                            <span
                              className="text-xs font-medium text-muted-foreground"
                              data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_b1cf_${week}_${task.id}`}>Day {task.day}</span>
                            <h4
                              className={cn(
                                'font-medium',
                                task.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                              )}
                              data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_6a8f_${week}_${task.id}`}>
                              {task.title}
                            </h4>
                          </div>
                          <p
                            className={cn(
                              'mt-1 text-sm',
                              task.completed ? 'text-muted-foreground line-through' : 'text-muted-foreground'
                            )}
                            data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_8dba_${week}_${task.id}`}>
                            {task.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* ─── Competitor Intelligence Tab ─────────────────────────────────── */}
        {activeTab === 'competitor' && (
          <div
            className="space-y-6"
            data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_4add">
            <Card
              className="p-6"
              data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_dd76">
              <div
                className="mb-6 flex items-center gap-3"
                data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_4527">
                <div
                  className="rounded-lg bg-secondary/10 p-3"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_34a6">
                  <Search
                    className="h-6 w-6 text-secondary"
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_0c4e" />
                </div>
                <div data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_b8ba">
                  <h2
                    className="text-xl font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_79f8">Competitor Intelligence</h2>
                  <p
                    className="text-sm text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_0a09">
                    Analyze competitors and get strategic insights
                  </p>
                </div>
              </div>

              <div
                className="flex gap-3"
                data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_5abc">
                <div
                  className="flex-1"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_17e9">
                  <Field
                    label="Competitor URL"
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_9f4e">
                    <Input
                      placeholder="https://example.com"
                      value={competitorUrl}
                      onChange={(e) => setCompetitorUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAnalyzeCompetitor();
                      }}
                      data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_265e" />
                  </Field>
                </div>
                <div
                  className="flex items-end"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_4362">
                  <Button
                    onClick={handleAnalyzeCompetitor}
                    disabled={isAnalyzingCompetitor}
                    className="min-w-[120px]"
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_69c8">
                    {isAnalyzingCompetitor ? (
                      <>
                        <Spinner
                          size="sm"
                          className="mr-2"
                          data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_ed8e" />
                        Analyzing
                      </>
                    ) : (
                      <>
                        <Search
                          className="mr-2 h-4 w-4"
                          data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_7b71" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {competitorError && (
                <Alert
                  variant="error"
                  className="mt-4"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_24fc">
                  {competitorError}
                </Alert>
              )}
            </Card>

            {/* Analysis Results */}
            {competitorAnalysis.length === 0 ? (
              <Card
                className="flex flex-col items-center justify-center py-12 text-center"
                data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_e9b1">
                <div
                  className="mb-4 rounded-full bg-muted p-4"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_acf3">
                  <Users
                    className="h-8 w-8 text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_1793" />
                </div>
                <h3
                  className="text-lg font-medium text-foreground"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_4c45">No Analyses Yet</h3>
                <p
                  className="mt-1 max-w-sm text-sm text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_7d79">
                  Enter a competitor URL above to get AI-powered competitive intelligence including SWOT analysis and strategic recommendations.
                </p>
              </Card>
            ) : (
              <div
                className="space-y-4"
                data-icod-id="src_pages_dashboard_dashboardbusinessgrowth_tsx_83ba">
                {competitorAnalysis.map((analysis, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden"
                    data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_a8db_${index}`}>
                    <div
                      className="flex items-center justify-between border-b border-border bg-muted/50 px-6 py-4"
                      data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_6132_${index}`}>
                      <div
                        className="flex items-center gap-3"
                        data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_faa1_${index}`}>
                        <Globe
                          className="h-5 w-5 text-muted-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_0db0_${index}`} />
                        <a
                          href={analysis.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                          data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_3afd_${index}`}>
                          {analysis.url}
                        </a>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCompetitorAnalysis(index)}
                        data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_ccc4_${index}`}>
                        Remove
                      </Button>
                    </div>
                    <div
                      className="p-6"
                      data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_98d6_${index}`}>
                      <div
                        className="prose prose-sm max-w-none dark:prose-invert"
                        data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_0820_${index}`}>
                        <pre
                          className="whitespace-pre-wrap font-sans text-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardbusinessgrowth_tsx_622c_${index}`}>
                          {analysis.analysis}
                        </pre>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
