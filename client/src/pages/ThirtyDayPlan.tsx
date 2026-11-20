import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  Calendar,
  Share2,
  RotateCcw,
  Trophy,
  Target,
  TrendingUp,
  Zap,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Rocket,
  Heart,
} from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import FAQAccordion from '@/components/FAQAccordion';
import AdSenseSlot from '@/components/AdSenseSlot';
import { Button, Card, Badge } from '@/components/ui';
import { SchemaInjector, PAGE_META } from '@/seo';

const thirtyDayPlanMeta = PAGE_META['/30-day-plan'];
import { cn } from '@/utils/cn';
import type { FAQItem } from '@/components/FAQAccordion';
import {
  thirtyDayPlan,
  phases,
  getPhaseInfo,
  getTotalTasks,
  type ThirtyDayEntry,
  type ThirtyDayTask,
} from '@/data/thirtyDaySchedule';

// ── localStorage key ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'mgbb-30day-plan';
const START_DATE_KEY = 'mgbb-30day-start-date';

// ── Helpers ───────────────────────────────────────────────────────────────────────

function loadProgress(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress: Record<string, boolean>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function loadStartDate(): string | null {
  return localStorage.getItem(START_DATE_KEY);
}

function saveStartDate(date: string): void {
  localStorage.setItem(START_DATE_KEY, date);
}

function getCurrentDay(startDate: string | null): number {
  if (!startDate) return 1;
  const start = new Date(startDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, Math.min(30, diffDays));
}

// Dynamic Lucide icon resolver
function PhaseIcon({ name, className }: { name: string; className?: string }) {
  const icons: Record<string, React.ElementType> = {
    Tag: Target,
    Palette: Sparkles,
    Store: ExternalLink,
    Image: Calendar,
    Video: Zap,
    Megaphone: Rocket,
    Users: MessageCircle,
    Film: Zap,
    Search: TrendingUp,
    Hash: Target,
    BookOpen: ExternalLink,
    TrendingUp,
    Bookmark: Target,
    Gift: Trophy,
    FileText: ClipboardCopy,
    Link: ExternalLink,
    Share2,
    Heart: Sparkles,
    Wrench: Zap,
    MessageSquare: MessageCircle,
    ClipboardList: Calendar,
    Target,
    Award: Trophy,
    ArrowLeftRight: TrendingUp,
    Rocket,
    Trophy,
    Clock: Target,
    BarChart3: TrendingUp,
    HandHeart: Heart,
    LineChart: TrendingUp,
  };

  // Fallback mapping for any unmatched names
  const fallback: Record<string, React.ElementType> = {
    Heart: Sparkles,
  };

  const Icon = icons[name] || fallback[name] || Target;
  return <Icon className={className} data-icod-id="src_pages_thirtydayplan_tsx_9453" />;
}

// ── Component ─────────────────────────────────────────────────────────────────────

export default function ThirtyDayPlan() {
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [startDate, setStartDateState] = useState<string | null>(null);
  const [showCopied, setShowCopied] = useState(false);
  const [completedPhases, setCompletedPhases] = useState<Set<string>>(new Set());
  const dayRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Load progress and start date on mount
  useEffect(() => {
    setProgress(loadProgress());
    setStartDateState(loadStartDate());
  }, []);

  // Track completed phases for confetti trigger
  useEffect(() => {
    const newlyCompleted = new Set<string>();
    for (const phase of phases) {
      const phaseDays = thirtyDayPlan.filter(
        (d) => d.day >= phase.dayRange[0] && d.day <= phase.dayRange[1],
      );
      const allDone = phaseDays.every((d) =>
        d.tasks.every((t) => progress[t.id]),
      );
      if (allDone) newlyCompleted.add(phase.name);
    }
    setCompletedPhases(newlyCompleted);
  }, [progress]);

  const toggleTask = useCallback(
    (taskId: string) => {
      setProgress((prev) => {
        const next = { ...prev, [taskId]: !prev[taskId] };
        saveProgress(next);
        return next;
      });
    },
    [],
  );

  const totalTasks = getTotalTasks();
  const completedTasks = Object.values(progress).filter(Boolean).length;
  const overallPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const currentDay = getCurrentDay(startDate);

  const toggleDayExpanded = (day: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const scrollToPhase = (phaseName: string) => {
    setActivePhase(phaseName === activePhase ? null : phaseName);
    const phase = phases.find((p) => p.name === phaseName);
    if (phase) {
      const firstDay = phase.dayRange[0];
      dayRefs.current[firstDay]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSetStartDate = () => {
    const today = new Date().toISOString().split('T')[0];
    saveStartDate(today);
    setStartDateState(today);
  };

  const handleReset = () => {
    setProgress({});
    saveProgress({});
    setShowResetConfirm(false);
  };

  const handleCopyPlan = async () => {
    const lines = thirtyDayPlan.map((day) => {
      const tasks = day.tasks
        .map((t) => `${progress[t.id] ? '[x]' : '[ ]'} ${t.text}`)
        .join('\n');
      return `Day ${day.day}: ${day.title}\n${tasks}`;
    });
    const text = `MG Blessed Beginnings — 30-Day Growth Plan\n${'='.repeat(50)}\n\n${lines.join('\n\n')}`;
    try {
      await navigator.clipboard.writeText(text);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const shareText = `Day ${currentDay}/30 ✅ — I've completed ${completedTasks}/${totalTasks} tasks on my MG Blessed Beginnings 30-day growth plan! Try it: ${window.location.origin}/30-day-plan`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My 30-Day Growth Plan', text: shareText, url: window.location.href });
      } catch {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      } catch {
        // Fallback
      }
    }
  };

  const filteredDays = activePhase
    ? thirtyDayPlan.filter((d) => d.phase === activePhase)
    : thirtyDayPlan;

  // ── Structured Data ───────────────────────────────────────────────────────────

  const thirtyDayFaqItems: FAQItem[] = [
    {
      question: 'What is the 30-Day Growth Plan?',
      answer: 'The 30-Day Growth Plan is a step-by-step action plan designed to help you reach 500 users or downloads in 30 days. It covers branding, content creation, referrals, community building, and analytics.',
    },
    {
      question: 'Is the 30-Day Growth Plan free?',
      answer: 'Yes, the 30-Day Growth Plan is completely free. You can track your progress, check off daily tasks, and share your achievements without any cost.',
    },
    {
      question: 'Do I need an account to use the 30-Day Plan?',
      answer: 'No account is required. Your progress is saved locally in your browser using localStorage, so it persists between sessions on the same device.',
    },
    {
      question: 'Can I restart or reset my progress?',
      answer: 'Yes, you can reset your progress at any time using the Reset Progress button. This will clear all checked tasks across all 30 days.',
    },
    {
      question: 'How does the phase system work?',
      answer: 'The plan is divided into phases like Foundation, Content Creation, Community Building, and Growth Acceleration. Each phase focuses on specific strategies and contains multiple daily tasks.',
    },
  ];

  const structuredData = [
    {
      '@type': 'HowTo',
      name: '30-Day Growth Plan — MG Blessed Beginnings',
      description: 'A step-by-step 30-day content marketing plan to reach 500 downloads for your app.',
      totalTime: 'P30D',
      step: thirtyDayPlan.map((day) => ({
        '@type': 'HowToStep',
        position: day.day,
        name: `Day ${day.day}: ${day.title}`,
        text: day.description,
      })),
    },
    {
      '@type': 'FAQPage',
      mainEntity: thirtyDayFaqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
  ];

  return (
    <>
      <SEOHead
        title={thirtyDayPlanMeta.title}
        description={thirtyDayPlanMeta.description}
        keywords={thirtyDayPlanMeta.keywords}
        canonicalUrl={thirtyDayPlanMeta.canonical}
        structuredData={structuredData}
        data-icod-id="src_pages_thirtydayplan_tsx_feaa" />
      <SchemaInjector
        schemaType="page"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: '30-Day Plan', url: '/30-day-plan' },
        ]}
        data-icod-id="src_pages_thirtydayplan_tsx_c4c5" />
      {/* ── Hero Section ────────────────────────────────────────────────────────── */}
      <section
        className="relative py-16 md:py-24 overflow-hidden"
        data-icod-id="src_pages_thirtydayplan_tsx_a9c2">
        {/* Background gradient orbs */}
        <div
          className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full opacity-[0.15] blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgb(var(--primary)) 0%, transparent 70%)' }}
          aria-hidden="true"
          data-icod-id="src_pages_thirtydayplan_tsx_2044" />
        <div
          className="pointer-events-none absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full opacity-[0.12] blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)' }}
          aria-hidden="true"
          data-icod-id="src_pages_thirtydayplan_tsx_8d57" />

        <div
          className="container mx-auto px-4 max-w-7xl text-center relative z-10"
          data-icod-id="src_pages_thirtydayplan_tsx_ab21">
          <div
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 mb-6"
            data-icod-id="src_pages_thirtydayplan_tsx_d1b7">
            <Rocket
              className="h-4 w-4 text-primary"
              data-icod-id="src_pages_thirtydayplan_tsx_d29d" />
            <span
              className="text-sm font-semibold text-primary"
              data-icod-id="src_pages_thirtydayplan_tsx_d2a5">30 Days to 500 Downloads</span>
          </div>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 font-heading tracking-tight leading-tight"
            data-icod-id="src_pages_thirtydayplan_tsx_2914">
            Your 30-Day{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'var(--gradient-primary)' }}
              data-icod-id="src_pages_thirtydayplan_tsx_bd1f">
              Growth Plan
            </span>
          </h1>

          <p
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
            data-icod-id="src_pages_thirtydayplan_tsx_654a">
            500 downloads in 30 days — one day at a time. Track your progress, check off daily tasks, and watch your app grow.
          </p>

          {/* Start date picker */}
          {!startDate && (
            <div
              className="mb-8 flex justify-center"
              data-icod-id="src_pages_thirtydayplan_tsx_b512">
              <Button
                variant="outline"
                size="md"
                onClick={handleSetStartDate}
                data-icod-id="src_pages_thirtydayplan_tsx_7544">
                <Calendar className="h-4 w-4 mr-2" data-icod-id="src_pages_thirtydayplan_tsx_3616" />
                Start My 30-Day Journey
              </Button>
            </div>
          )}

          {/* Overall progress bar */}
          <div
            className="max-w-md mx-auto mb-10"
            data-icod-id="src_pages_thirtydayplan_tsx_0512">
            <div
              className="flex items-center justify-between text-sm mb-2"
              data-icod-id="src_pages_thirtydayplan_tsx_638e">
              <span
                className="text-muted-foreground"
                data-icod-id="src_pages_thirtydayplan_tsx_f0a7">Overall Progress</span>
              <span
                className="font-semibold text-foreground"
                data-icod-id="src_pages_thirtydayplan_tsx_e900">{completedTasks}/{totalTasks} tasks ({overallPercent}%)</span>
            </div>
            <div
              className="h-3 w-full rounded-full bg-muted/20 overflow-hidden"
              data-icod-id="src_pages_thirtydayplan_tsx_acfa">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${overallPercent}%`,
                  background: 'var(--gradient-primary)',
                }}
                data-icod-id="src_pages_thirtydayplan_tsx_ea42" />
            </div>
          </div>

          {/* Phase navigation pills */}
          <div
            className="flex flex-wrap justify-center gap-2"
            data-icod-id="src_pages_thirtydayplan_tsx_d08c">
            {phases.map((phase) => {
              const isActive = activePhase === phase.name;
              return (
                <button
                  key={phase.name}
                  onClick={() => scrollToPhase(phase.name)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300',
                    isActive
                      ? `${phase.bgClass} ${phase.colorClass} ${phase.borderClass}`
                      : 'bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
                  )}
                  data-icod-id={`src_pages_thirtydayplan_tsx_418d_${phase.name}`}>
                  {phase.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>
      {/* Ad Banner after Hero */}
      <div
        className="container mx-auto px-4 py-6"
        data-icod-id="src_pages_thirtydayplan_tsx_91be">
        <AdSenseSlot format="banner" data-icod-id="src_pages_thirtydayplan_tsx_dbbc" />
      </div>
      {/* ── Day Cards Timeline ─────────────────────────────────────────────────── */}
      <section
        className="container mx-auto px-4 max-w-7xl pb-16"
        data-icod-id="src_pages_thirtydayplan_tsx_607b">
        <div className="relative" data-icod-id="src_pages_thirtydayplan_tsx_84bb">
          {/* Vertical timeline line */}
          <div
            className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-border/50 hidden sm:block"
            aria-hidden="true"
            data-icod-id="src_pages_thirtydayplan_tsx_3bdb" />

          <div className="space-y-6" data-icod-id="src_pages_thirtydayplan_tsx_e398">
            {filteredDays.map((day) => (
              <DayCard
                key={day.day}
                entry={day}
                progress={progress}
                isExpanded={expandedDays.has(day.day)}
                isCurrentDay={day.day === currentDay}
                isPhaseComplete={completedPhases.has(day.phase)}
                onToggleTask={toggleTask}
                onToggleExpand={() => toggleDayExpanded(day.day)}
                ref={(el) => { dayRefs.current[day.day] = el; }}
                data-icod-id={`src_pages_thirtydayplan_tsx_d305_${day.day}`} />
            ))}
          </div>
        </div>
      </section>
      {/* ── Phase Summary Grid ─────────────────────────────────────────────────── */}
      <section
        className="container mx-auto px-4 max-w-7xl pb-16"
        data-icod-id="src_pages_thirtydayplan_tsx_5a02">
        <h2
          className="text-2xl md:text-3xl font-bold text-foreground mb-8 font-heading text-center"
          data-icod-id="src_pages_thirtydayplan_tsx_7cc5">
          Phase Overview
        </h2>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          data-icod-id="src_pages_thirtydayplan_tsx_9476">
          {phases.map((phase) => {
            const phaseDays = thirtyDayPlan.filter(
              (d) => d.day >= phase.dayRange[0] && d.day <= phase.dayRange[1],
            );
            const phaseTotalTasks = phaseDays.reduce((sum, d) => sum + d.tasks.length, 0);
            const phaseCompletedTasks = phaseDays.reduce(
              (sum, d) => sum + d.tasks.filter((t) => progress[t.id]).length,
              0,
            );
            const phasePercent =
              phaseTotalTasks > 0 ? Math.round((phaseCompletedTasks / phaseTotalTasks) * 100) : 0;

            return (
              <Card
                key={phase.name}
                hoverLift={false}
                className={cn('p-5 cursor-pointer', phase.borderClass)}
                onClick={() => scrollToPhase(phase.name)}
                data-icod-id={`src_pages_thirtydayplan_tsx_1851_${phase.name}`}>
                <div
                  className="flex items-center justify-between mb-3"
                  data-icod-id={`src_pages_thirtydayplan_tsx_2908_${phase.name}`}>
                  <span
                    className={cn('text-sm font-semibold', phase.colorClass)}
                    data-icod-id={`src_pages_thirtydayplan_tsx_ff8d_${phase.name}`}>{phase.name}</span>
                  <span
                    className="text-xs text-muted-foreground"
                    data-icod-id={`src_pages_thirtydayplan_tsx_17fb_${phase.name}`}>
                    Days {phase.dayRange[0]}-{phase.dayRange[1]}
                  </span>
                </div>
                <div
                  className="text-2xl font-bold text-foreground mb-2"
                  data-icod-id={`src_pages_thirtydayplan_tsx_89bf_${phase.name}`}>
                  {phaseCompletedTasks}/{phaseTotalTasks}
                </div>
                <div
                  className="h-2 w-full rounded-full bg-muted/20 overflow-hidden"
                  data-icod-id={`src_pages_thirtydayplan_tsx_e9e3_${phase.name}`}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${phasePercent}%`,
                      backgroundColor: phase.color,
                    }}
                    data-icod-id={`src_pages_thirtydayplan_tsx_7ab7_${phase.name}`} />
                </div>
                {phasePercent === 100 && (
                  <div
                    className="mt-2 flex items-center gap-1 text-xs text-success font-medium"
                    data-icod-id={`src_pages_thirtydayplan_tsx_338c_${phase.name}`}>
                    <Check
                      className="h-3 w-3"
                      data-icod-id={`src_pages_thirtydayplan_tsx_348b_${phase.name}`} />
                    Complete
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>
      {/* ── Quick Actions Footer ───────────────────────────────────────────────── */}
      <section
        className="border-t border-border bg-card/50 py-12"
        data-icod-id="src_pages_thirtydayplan_tsx_2c05">
        <div
          className="container mx-auto px-4 max-w-7xl"
          data-icod-id="src_pages_thirtydayplan_tsx_d03c">
          <h2
            className="text-xl font-bold text-foreground mb-6 font-heading text-center"
            data-icod-id="src_pages_thirtydayplan_tsx_26a2">
            Quick Actions
          </h2>
          <div
            className="flex flex-wrap items-center justify-center gap-3"
            data-icod-id="src_pages_thirtydayplan_tsx_290a">
            <Button
              variant="secondary"
              size="md"
              onClick={handleCopyPlan}
              data-icod-id="src_pages_thirtydayplan_tsx_c642">
              <ClipboardCopy className="h-4 w-4 mr-2" data-icod-id="src_pages_thirtydayplan_tsx_0b78" />
              {showCopied ? 'Copied!' : 'Copy Full Plan'}
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={handleShare}
              data-icod-id="src_pages_thirtydayplan_tsx_caa8">
              <Share2 className="h-4 w-4 mr-2" data-icod-id="src_pages_thirtydayplan_tsx_bdc1" />
              Share Progress
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="text-warning"
              onClick={() => setShowResetConfirm(true)}
              data-icod-id="src_pages_thirtydayplan_tsx_ed11">
              <RotateCcw className="h-4 w-4 mr-2" data-icod-id="src_pages_thirtydayplan_tsx_4463" />
              Reset Progress
            </Button>
          </div>

          {/* WhatsApp share */}
          <div
            className="mt-6 flex justify-center"
            data-icod-id="src_pages_thirtydayplan_tsx_7cae">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `I'm following the MG Blessed Beginnings 30-Day Growth Plan! Day ${currentDay}/30 — ${completedTasks}/${totalTasks} tasks done. Join me: ${window.location.origin}/30-day-plan`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              data-icod-id="src_pages_thirtydayplan_tsx_222d">
              <Button
                variant="ghost"
                size="sm"
                className="text-success"
                data-icod-id="src_pages_thirtydayplan_tsx_e245">
                <MessageCircle className="h-4 w-4 mr-2" data-icod-id="src_pages_thirtydayplan_tsx_8542" />
                Share on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-20 bg-background" data-icod-id="src_pages_thirtydayplan_tsx_faq_section">
        <div className="max-w-3xl mx-auto px-4" data-icod-id="src_pages_thirtydayplan_tsx_faq_container">
          <h2
            className="text-2xl md:text-3xl font-bold text-foreground font-heading text-center mb-10"
            data-icod-id="src_pages_thirtydayplan_tsx_faq_title">
            Frequently Asked Questions
          </h2>
          <FAQAccordion items={thirtyDayFaqItems} data-icod-id="src_pages_thirtydayplan_tsx_faq_accordion" />
        </div>
      </section>
      {/* ── Reset Confirmation Modal ───────────────────────────────────────────── */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          data-icod-id="src_pages_thirtydayplan_tsx_994e">
          <Card
            hoverLift={false}
            className="max-w-sm w-full p-6 text-center"
            data-icod-id="src_pages_thirtydayplan_tsx_e601">
            <h3
              className="text-lg font-bold text-foreground mb-3"
              data-icod-id="src_pages_thirtydayplan_tsx_63e7">Reset All Progress?</h3>
            <p
              className="text-sm text-muted-foreground mb-6"
              data-icod-id="src_pages_thirtydayplan_tsx_a6d9">
              This will clear all checked tasks across all 30 days. This action cannot be undone.
            </p>
            <div
              className="flex gap-3 justify-center"
              data-icod-id="src_pages_thirtydayplan_tsx_c364">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowResetConfirm(false)}
                data-icod-id="src_pages_thirtydayplan_tsx_be56">
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReset}
                data-icod-id="src_pages_thirtydayplan_tsx_a906">
                Reset Everything
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

// ── Day Card Sub-component ────────────────────────────────────────────────────────

interface DayCardProps {
  entry: ThirtyDayEntry;
  progress: Record<string, boolean>;
  isExpanded: boolean;
  isCurrentDay: boolean;
  isPhaseComplete: boolean;
  onToggleTask: (taskId: string) => void;
  onToggleExpand: () => void;
}

const DayCard = ({
  entry,
  progress,
  isExpanded,
  isCurrentDay,
  isPhaseComplete,
  onToggleTask,
  onToggleExpand,
  ...rest
}: DayCardProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const phaseInfo = getPhaseInfo(entry.phase);
  const completedCount = entry.tasks.filter((t) => progress[t.id]).length;
  const totalCount = entry.tasks.length;
  const allDone = completedCount === totalCount;

  return (
    <div
      className={cn(
        'relative sm:pl-16 md:pl-20 transition-all duration-300',
      )}
      data-icod-id="src_pages_thirtydayplan_tsx_8bf9"
      {...rest}>
      {/* Timeline dot */}
      <div
        className={cn(
          'hidden sm:flex absolute left-3 md:left-5 top-6 h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-full border-2 text-xs font-bold z-10 transition-all duration-300',
          allDone
            ? 'bg-success border-success text-primary-foreground'
            : isCurrentDay
              ? `${phaseInfo.bgClass} ${phaseInfo.borderClass} ${phaseInfo.colorClass} ring-2 ring-primary/30`
              : 'bg-card border-border text-muted-foreground',
        )}
        aria-hidden="true"
        data-icod-id="src_pages_thirtydayplan_tsx_d04e">
        {allDone ? <Check className="h-3 w-3" data-icod-id="src_pages_thirtydayplan_tsx_4725" /> : entry.day}
      </div>
      <Card
        hoverLift={false}
        className={cn(
          'overflow-hidden transition-all duration-300',
          isCurrentDay && 'ring-2 ring-primary/40 shadow-[0_0_20px_rgba(109,0,217,0.2)]',
          allDone && 'border-success/30',
          isPhaseComplete && !allDone && 'opacity-90',
        )}
        data-icod-id="src_pages_thirtydayplan_tsx_ef80">
        {/* Header row */}
        <div
          className="flex items-start gap-3 p-4 md:p-5 cursor-pointer select-none"
          onClick={onToggleExpand}
          data-icod-id="src_pages_thirtydayplan_tsx_ede5">
          {/* Mobile day badge */}
          <div
            className={cn(
              'sm:hidden flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold border',
              allDone
                ? 'bg-success border-success text-primary-foreground'
                : `${phaseInfo.bgClass} ${phaseInfo.borderClass} ${phaseInfo.colorClass}`,
            )}
            data-icod-id="src_pages_thirtydayplan_tsx_c3ab">
            {allDone ? <Check className="h-3 w-3" data-icod-id="src_pages_thirtydayplan_tsx_4c6c" /> : entry.day}
          </div>

          <div
            className="flex-1 min-w-0"
            data-icod-id="src_pages_thirtydayplan_tsx_64cb">
            <div
              className="flex items-center gap-2 mb-1 flex-wrap"
              data-icod-id="src_pages_thirtydayplan_tsx_db1d">
              <Badge
                className={cn(
                  'text-[10px] px-2 py-0.5',
                  phaseInfo.bgClass,
                  phaseInfo.colorClass,
                  phaseInfo.borderClass,
                  'border',
                )}
                data-icod-id="src_pages_thirtydayplan_tsx_2b0b">
                {entry.phase}
              </Badge>
              {isCurrentDay && (
                <span
                  className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20"
                  data-icod-id="src_pages_thirtydayplan_tsx_bf84">
                  TODAY
                </span>
              )}
              {allDone && (
                <span
                  className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20"
                  data-icod-id="src_pages_thirtydayplan_tsx_186a">
                  DONE
                </span>
              )}
            </div>

            <h3
              className="text-base md:text-lg font-semibold text-foreground leading-snug"
              data-icod-id="src_pages_thirtydayplan_tsx_c4ac">
              Day {entry.day}: {entry.title}
            </h3>

            {/* Task progress mini-bar */}
            <div
              className="flex items-center gap-2 mt-2"
              data-icod-id="src_pages_thirtydayplan_tsx_d90f">
              <div
                className="h-1.5 flex-1 max-w-[120px] rounded-full bg-muted/20 overflow-hidden"
                data-icod-id="src_pages_thirtydayplan_tsx_f2e8">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                    backgroundColor: allDone ? 'rgb(var(--success))' : phaseInfo.color,
                  }}
                  data-icod-id="src_pages_thirtydayplan_tsx_8be3" />
              </div>
              <span
                className="text-xs text-muted-foreground"
                data-icod-id="src_pages_thirtydayplan_tsx_ed82">
                {completedCount}/{totalCount}
              </span>
            </div>
          </div>

          <div
            className="flex items-center gap-2 flex-shrink-0"
            data-icod-id="src_pages_thirtydayplan_tsx_c029">
            <PhaseIcon
              name={entry.icon}
              className={cn('h-5 w-5', phaseInfo.colorClass)}
              data-icod-id="src_pages_thirtydayplan_tsx_e893" />
            {isExpanded ? (
              <ChevronUp
                className="h-4 w-4 text-muted-foreground"
                data-icod-id="src_pages_thirtydayplan_tsx_d86c" />
            ) : (
              <ChevronDown
                className="h-4 w-4 text-muted-foreground"
                data-icod-id="src_pages_thirtydayplan_tsx_a49a" />
            )}
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div
            className="px-4 md:px-5 pb-5 pt-0 border-t border-border/50"
            data-icod-id="src_pages_thirtydayplan_tsx_25e8">
            <p
              className="text-sm text-muted-foreground mt-4 mb-4 leading-relaxed"
              data-icod-id="src_pages_thirtydayplan_tsx_cd59">
              {entry.description}
            </p>

            {/* Task checklist */}
            <div className="space-y-2" data-icod-id="src_pages_thirtydayplan_tsx_a560">
              {entry.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isChecked={!!progress[task.id]}
                  onToggle={() => onToggleTask(task.id)}
                  data-icod-id={`src_pages_thirtydayplan_tsx_f536_${task.id}`} />
              ))}
            </div>

            {/* Pro tip callout */}
            {entry.tip && (
              <div
                className={cn(
                  'mt-4 p-3 rounded-xl text-sm border',
                  phaseInfo.bgClass,
                  phaseInfo.borderClass,
                )}
                data-icod-id="src_pages_thirtydayplan_tsx_08a2">
                <div
                  className="flex items-start gap-2"
                  data-icod-id="src_pages_thirtydayplan_tsx_fabb">
                  <Sparkles
                    className={cn('h-4 w-4 mt-0.5 flex-shrink-0', phaseInfo.colorClass)}
                    data-icod-id="src_pages_thirtydayplan_tsx_6329" />
                  <span
                    className={cn('leading-relaxed', phaseInfo.colorClass)}
                    data-icod-id="src_pages_thirtydayplan_tsx_a86e">
                    <strong data-icod-id="src_pages_thirtydayplan_tsx_dad5">Pro Tip:</strong> {entry.tip}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

// ── Task Item Sub-component ───────────────────────────────────────────────────────

function TaskItem({
  task,
  isChecked,
  onToggle,
}: {
  task: ThirtyDayTask;
  isChecked: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        'group flex items-start gap-3 p-2.5 rounded-lg transition-all duration-200',
        isChecked ? 'bg-success/5' : 'hover:bg-primary/5',
      )}
      data-icod-id="src_pages_thirtydayplan_tsx_a715">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={cn(
          'flex-shrink-0 mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-all duration-200',
          isChecked
            ? 'bg-success border-success text-primary-foreground'
            : 'border-muted-foreground/40 group-hover:border-primary/60',
        )}
        aria-label={isChecked ? 'Uncheck task' : 'Check task'}
        data-icod-id="src_pages_thirtydayplan_tsx_6e8c">
        {isChecked && <Check className="h-3 w-3" data-icod-id="src_pages_thirtydayplan_tsx_0a03" />}
      </button>
      <div
        className="flex-1 min-w-0"
        data-icod-id="src_pages_thirtydayplan_tsx_c95a">
        <span
          className={cn(
            'text-sm leading-relaxed transition-all duration-200',
            isChecked ? 'text-muted-foreground line-through decoration-muted-foreground/40' : 'text-foreground',
          )}
          data-icod-id="src_pages_thirtydayplan_tsx_a07e">
          {task.text}
        </span>

        {task.link && (
          <Link
            to={task.link}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 ml-2 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
            data-icod-id="src_pages_thirtydayplan_tsx_2acf">
            Go to
            <ExternalLink className="h-3 w-3" data-icod-id="src_pages_thirtydayplan_tsx_9ef6" />
          </Link>
        )}
      </div>
    </div>
  );
}
