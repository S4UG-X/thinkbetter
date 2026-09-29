"use client";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileText,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  LockKeyhole,
  Medal,
  Scale,
  Search,
  SkipForward,
  Target,
} from "lucide-react";
import {
  type ComponentProps,
  type FormEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  type AssessmentAnswer,
  type AssessmentReport,
  type QuestionId,
  type ResultSummary,
  emptyAnswers,
  questionIds,
  questions,
} from "@/lib/assessment";
import { demoAssessmentReport } from "@/lib/demo-report";

type FunnelEvent = "test_started" | "test_completed";
type View = "landing" | "assessment" | "scoring" | "preview" | "report";

type WebMcpTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };
  execute(input: unknown): unknown | Promise<unknown>;
};

declare global {
  interface Document {
    readonly modelContext?: {
      registerTool(
        tool: WebMcpTool,
        options?: { signal?: AbortSignal },
      ): void | Promise<void>;
    };
  }
}

const campusImage = "/campus-quad.png";
const measureProtectImproveImage = "/measure-protect-improve.png";
const guidedReasoningImage = "/guided-reasoning-intervention.png";
const thinkBetterComparisonImage = "/thinkbetter-comparison.png";
const criticalThinkingLevelsImage = "/critical-thinking-levels.png";

const navItems = [
  { label: "Home", href: "#top" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Research", href: "#research" },
  { label: "FAQ", href: "#faq" },
];

const skillIcons = [Search, Scale, FileText, Lightbulb, Target];

function assertEmptyToolInput(input: unknown) {
  if (input === undefined || input === null) return;
  if (
    typeof input !== "object" ||
    Array.isArray(input) ||
    Object.keys(input).length > 0
  ) {
    throw new Error("This tool does not accept input fields.");
  }
}

async function recordEvent(event: FunnelEvent) {
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event }),
      keepalive: true,
    });
  } catch {
    // Analytics must never interrupt the assessment.
  }
}

function summaryPercent(summary: ResultSummary) {
  if (summary.maximumScore <= 0 || summary.ratedItems <= 0) return null;
  return Math.round((summary.score / summary.maximumScore) * 100);
}

function getOverallScore(report: AssessmentReport) {
  const scores = [
    summaryPercent(report.mcqAccuracy),
    summaryPercent(report.writtenReasoning),
  ].filter((score): score is number => score !== null);

  if (!scores.length) return 0;
  return Math.round(scores.reduce((total, score) => total + score, 0) / scores.length);
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Above Average";
  if (score >= 65) return "Solid Foundation";
  if (score >= 45) return "Developing";
  return "Needs Practice";
}

function getQuestionTheme(index: number) {
  const themes = [
    "Evidence Evaluation",
    "Assumption Check",
    "Causal Reasoning",
    "Alternative Explanations",
    "Logical Structure",
    "Decision Quality",
  ];

  return themes[index % themes.length];
}

function Brand({ href = "/" }: { href?: string }) {
  return (
    <a
      className="inline-flex min-w-0 items-center gap-3 font-serif text-2xl font-semibold text-ink outline-none focus-visible:ring-3 focus-visible:ring-accent/40"
      href={href}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full border border-accent/30 bg-accent-soft text-accent">
        <BrainCircuit aria-hidden="true" className="size-6" />
      </span>
      <span className="truncate">ThinkBetter</span>
    </a>
  );
}

function SiteHeader({
  active = "Home",
  actionLabel,
  onAction,
}: {
  active?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
        <Brand href="#top" />
        <nav aria-label="Main" className="hidden items-center gap-10 text-sm font-semibold text-ink-muted lg:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              className={`border-b-2 py-7 transition-colors hover:border-accent hover:text-ink ${
                item.label === active
                  ? "border-accent text-ink"
                  : "border-transparent"
              }`}
              href={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 border-r border-border pr-4 text-sm font-medium text-ink-muted md:flex">
            <HelpCircle aria-hidden="true" className="size-5 text-accent" />
            <span>Help</span>
          </div>
          {onAction && (
            <ActionButton
              onActivate={onAction}
              className="min-h-11 rounded-md bg-primary px-4 text-primary-foreground shadow-sm hover:bg-accent"
            >
              {actionLabel ?? "Start Free Test"}
              <ArrowRight aria-hidden="true" className="size-4" />
            </ActionButton>
          )}
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>A practical critical-thinking assessment for learning and reflection.</p>
        <nav aria-label="Legal" className="flex gap-5">
          <a className="underline decoration-border underline-offset-4 hover:text-accent" href="/privacy">
            Privacy
          </a>
          <a className="underline decoration-border underline-offset-4 hover:text-accent" href="/terms">
            Terms
          </a>
        </nav>
      </div>
    </footer>
  );
}

function ActionButton({
  onActivate,
  onClick,
  type = "button",
  ...props
}: ComponentProps<typeof Button> & { onActivate: () => void }) {
  return (
    <Button
      {...props}
      type={type}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        onActivate();
      }}
    />
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-[8rem_1fr_2rem] items-center gap-3 text-xs text-ink-muted">
      <span>{label}</span>
      <span className="h-2 overflow-hidden rounded-full bg-secondary">
        <span
          className="block h-full rounded-full bg-accent"
          style={{ width: `${value}%` }}
        />
      </span>
      <span className="text-right font-semibold text-ink">{value}</span>
    </div>
  );
}

function Landing({
  onStart,
  onViewReport,
}: {
  onStart: () => void;
  onViewReport: () => void;
}) {
  const benefits = [
    {
      icon: BarChart3,
      title: "Evidence-based questions",
      copy: "Built around everyday claims, causal reasoning, evidence quality, and uncertainty.",
    },
    {
      icon: FileText,
      title: "Detailed performance feedback",
      copy: "See what your answers suggest and where your reasoning can get sharper.",
    },
    {
      icon: Lightbulb,
      title: "Personalized growth recommendations",
      copy: "Get practical next steps for school, work, and everyday decisions.",
    },
    {
      icon: GraduationCap,
      title: "Designed for students",
      copy: "Clear, relevant, and focused on building stronger thinking habits.",
    },
  ];

  const testimonials = [
    {
      quote: "The feedback helped me see my strengths and gave me clear ways to improve.",
      name: "Maya R.",
      school: "Stanford University",
    },
    {
      quote: "A quick and eye-opening test. I learned where I can grow.",
      name: "Daniel K.",
      school: "UC Berkeley",
    },
    {
      quote: "Short, insightful, and actually useful before college applications.",
      name: "Sophia L.",
      school: "University of Michigan",
    },
  ];

  return (
    <main id="main-content" className="min-h-screen overflow-hidden bg-background">
      <SiteHeader active="Home" actionLabel="Start Free Test" onAction={onStart} />

      <section id="top" className="relative overflow-hidden border-b border-border bg-background">
        <div className="absolute inset-y-0 right-0 hidden w-[66%] lg:block">
          <img
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover object-center"
            src={campusImage}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/65 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background/20" />
        </div>

        <div className="relative mx-auto grid min-h-[38rem] w-full max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:py-16">
          <div className="relative z-10 max-w-2xl">
            <p className="eyebrow">Backed by research</p>
            <h1 className="balance mt-4 max-w-3xl font-serif text-5xl font-semibold leading-[0.98] text-ink sm:text-6xl lg:text-7xl">
              Use AI without letting it think for you.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink-muted">
              ThinkBetter helps you recognize when you&apos;re outsourcing too much
              of your reasoning to AI. It gives you real-time prompts to think for
              yourself, shows where your reasoning is becoming weaker, and tracks
              whether your critical-thinking skills improve over time.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ActionButton
                className="min-h-14 rounded-md bg-primary px-8 text-base text-primary-foreground shadow-lg shadow-accent/15 hover:bg-accent"
                size="lg"
                onActivate={onStart}
              >
                Start a Free Test
                <ArrowRight aria-hidden="true" className="size-5" />
              </ActionButton>
              <ActionButton
                className="min-h-14 rounded-md border-accent/40 bg-card px-7 text-base text-accent hover:bg-blue-soft"
                size="lg"
                variant="outline"
                onActivate={onViewReport}
              >
                View Personalized Demo Report
                <BarChart3 aria-hidden="true" className="size-5" />
              </ActionButton>
            </div>
            <p className="mt-4 flex items-center gap-3 text-sm font-semibold text-ink-muted">
              <CheckCircle2 aria-hidden="true" className="size-4 text-accent" />
              No credit card required
              <span aria-hidden="true">-</span>
              about 8 minutes
            </p>
          </div>

          <div className="relative h-72 overflow-hidden rounded-md lg:hidden">
            <img
              alt="Sunlit university campus with gothic buildings and trees"
              className="absolute inset-0 size-full object-cover"
              src={campusImage}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/75 via-background/20 to-transparent" />
          </div>
        </div>
      </section>
{/* //whagt is this  */}
<section className="border-b border-border bg-background">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <div>
            <p className="eyebrow">Reasoning stays yours</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              A useful pause before AI gives the answer.
            </h2>
            <p className="mt-5 text-lg leading-8 text-ink-muted">
              ThinkBetter notices when a request hands too much of the reasoning
              to AI, then replaces the shortcut with a focused prompt that keeps
              you involved in the work.
            </p>
            <ul className="mt-6 space-y-4 text-sm font-semibold text-ink-muted">
              {[
                "Recognize over-reliance in the moment",
                "Prompt for evidence, assumptions, and alternatives",
                "Track whether independent reasoning improves",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 aria-hidden="true" className="size-5 shrink-0 text-green-ink" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <figure className="overflow-hidden rounded-md border border-border bg-card shadow-lg shadow-ink/5">
            <img
              alt="A student asks AI to write an argument, ThinkBetter recognizes over-reliance, and responds with a guided evidence question"
              className="aspect-[3/2] w-full object-cover"
              src={guidedReasoningImage}
            />
          </figure>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 border-b border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8">
          <div className="text-center">
            <h2 className="font-serif text-4xl font-semibold text-ink sm:text-5xl">How It Works</h2>
            <p className="mt-3 text-lg text-ink-muted">
              A simple, research-backed process to help you think for yourself.
            </p>
          </div>
          <div className="mt-10 overflow-x-auto pb-2">
            <figure className="min-w-[48rem] overflow-hidden rounded-md border border-border bg-background shadow-sm sm:min-w-0">
              <img
                alt="Measure, Protect, Improve: establish a critical-thinking baseline, preserve independent reasoning with guided prompts, and track improvement over time"
                className="aspect-[2/1] w-full object-cover"
                src={measureProtectImproveImage}
              />
            </figure>
          </div>
        </div>
      </section>
 
      <section className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">ThinkBetter in action</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              See how the reasoning layer changes the conversation.
            </h2>
            <p className="mt-4 text-lg leading-8 text-ink-muted">
              Compare a direct answer with a guided response, then choose how
              strongly ThinkBetter should challenge you.
            </p>
          </div>

          <div className="mt-10 space-y-8">
            <div className="overflow-x-auto pb-2">
              <figure className="min-w-[58rem] overflow-hidden rounded-md border border-border bg-background shadow-sm sm:min-w-0">
                <img
                  alt="Comparison of a direct AI answer with a ThinkBetter-guided response that asks the student to examine evidence, risks, and both sides"
                  className="aspect-video w-full object-cover"
                  src={thinkBetterComparisonImage}
                />
              </figure>
            </div>

            <div className="overflow-x-auto pb-2">
              <figure className="min-w-[58rem] overflow-hidden rounded-md border border-border bg-background shadow-sm sm:min-w-0">
                <img
                  alt="Critical Thinking Level control with Light, Balanced, Deep, and Full Critical settings and example responses"
                  className="aspect-video w-full object-cover"
                  src={criticalThinkingLevelsImage}
                />
              </figure>
            </div>
          </div>
        </div>
      </section>

    


      <section id="research" className="relative overflow-hidden border-b border-border">
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-50 lg:block"
          src={campusImage}
        />
        <div className="absolute inset-y-0 right-0 hidden w-2/3 bg-gradient-to-r from-background via-background/85 to-transparent lg:block" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="eyebrow">Grounded in research</p>
            <h2 className="mt-4 max-w-xl font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              Built on decades of cognitive science.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-ink-muted">
              The assessment focuses on analysis, logical reasoning, evidence
              evaluation, alternative explanations, and decisions under uncertainty.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-6 rounded-md border-accent/50 bg-card text-accent hover:bg-accent-soft"
            >
              Learn About Our Research
              <ArrowRight aria-hidden="true" className="size-4" />
            </Button>
          </div>
          <blockquote className="max-w-md rounded-md border border-border bg-card/95 p-8 shadow-xl shadow-ink/10">
            <BookOpen aria-hidden="true" className="size-8 text-gold" />
            <p className="mt-4 font-serif text-2xl font-semibold italic leading-9 text-ink">
              Critical thinking is one of the most important skills for success in college and beyond.
            </p>
            <footer className="mt-5 text-sm font-semibold text-ink-muted">
              Stanford Center for Assessment, Learning, and Equity
            </footer>
          </blockquote>
        </div>
      </section>

      

     

     

      <section id="faq" className="border-b border-border bg-card">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="eyebrow">Common questions</p>
            <h2 className="mt-3 font-serif text-4xl font-semibold text-ink">Frequently Asked Questions</h2>
            <p className="mt-3 text-ink-muted">Quick answers to help you get started.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "How long does the test take?",
              "Is it really free?",
              "What kind of questions are on the test?",
              "Who creates the test?",
              "Will I get personalized recommendations?",
              "How is my data used?",
            ].map((question) => (
              <details key={question} className="group rounded-md border border-border bg-background px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink">
                  {question}
                  <span className="text-lg text-accent group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-ink-muted">
                  The assessment is designed as a learning tool and keeps the result
                  focused on practical feedback.
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
        <div className="relative overflow-hidden rounded-md bg-primary p-8 text-primary-foreground shadow-xl">
          <img
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover opacity-25"
            src={campusImage}
          />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Build a brighter tomorrow</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold">Start your free critical thinking test today.</h2>
              <p className="mt-2 text-sm text-primary-foreground/80">
                Get personalized insights in one focused session.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ActionButton
                variant="outline"
                onActivate={onViewReport}
                className="min-h-12 rounded-md border-card/50 bg-transparent px-7 text-primary-foreground hover:bg-card/10 hover:text-primary-foreground"
              >
                View Personalized Report
                <BarChart3 aria-hidden="true" className="size-4" />
              </ActionButton>
              <ActionButton
                onActivate={onStart}
                className="min-h-12 rounded-md bg-card px-7 text-ink hover:bg-gold-soft"
              >
                Start Free Test
                <ArrowRight aria-hidden="true" className="size-4" />
              </ActionButton>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function Assessment({
  answer,
  currentIndex,
  confirmIncomplete,
  headingRef,
  onAnswer,
  onBack,
  onContinue,
  onKeepEditing,
  onSkip,
}: {
  answer: AssessmentAnswer;
  currentIndex: number;
  confirmIncomplete: boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onAnswer: (answer: AssessmentAnswer) => void;
  onBack: () => void;
  onContinue: (force: boolean) => void;
  onKeepEditing: () => void;
  onSkip: () => void;
}) {
  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isFinal = currentIndex === questions.length - 1;
  const requiresExplanation = question.responseType !== "multiple-choice";
  const hasLongPrompt = question.stem.length > 180 || question.stem.includes("\n");
  const incompleteMessage =
    question.responseType === "multiple-choice"
      ? "No option is selected. If you continue, this question will be marked not rated rather than incorrect."
      : !answer.choice && !answer.explanation.trim()
        ? "This question has no answer. If you continue, it will be marked not rated rather than incorrect."
        : !answer.choice && question.responseType === "choice-and-explanation"
          ? "No option is selected. You can continue, but the written-reasoning score will reflect only the explanation you submitted."
          : "Your written reasoning is blank. You can continue, but the score for this item will reflect only the option you selected.";

  return (
    <main id="main-content" className="min-h-screen bg-background">
      <SiteHeader active="How It Works" />

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-7 sm:px-8 lg:grid-cols-[18rem_1fr_16rem] lg:items-center">
          <div>
            <p className="font-serif text-xl font-semibold text-ink">Critical Thinking Assessment</p>
            <p className="mt-1 text-sm text-ink-muted">Question {currentIndex + 1} of {questions.length}</p>
          </div>
          <div className="flex min-w-0 items-center gap-2 overflow-x-auto py-2">
            {questions.map((stepQuestion, index) => {
              const complete = index < currentIndex;
              const current = index === currentIndex;
              return (
                <span key={stepQuestion.id} className="flex items-center gap-2">
                  <span
                    className={`grid size-8 place-items-center rounded-full border text-xs font-bold ${
                      complete
                        ? "border-accent bg-accent text-primary-foreground"
                        : current
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-ink-muted"
                    }`}
                    aria-current={current ? "step" : undefined}
                  >
                    {complete ? <Check aria-hidden="true" className="size-4" /> : index + 1}
                  </span>
                  {index < questions.length - 1 && <span className="h-px w-6 bg-border" />}
                </span>
              );
            })}
          </div>
          <div className="flex items-center gap-3 lg:justify-end">
            <span className="grid size-11 place-items-center rounded-full border border-accent/40 bg-blue-soft text-accent">
              <Clock3 aria-hidden="true" className="size-6" />
            </span>
            <div>
              <p className="font-serif text-lg font-semibold text-ink">About 8 min left</p>
              <Progress
                value={progress}
                aria-label={`Assessment progress: question ${currentIndex + 1} of ${questions.length}`}
                className="mt-2 h-1.5 w-32 rounded-full bg-secondary [&_[data-slot=progress-indicator]]:bg-gold"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[20rem_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-28 overflow-hidden rounded-md border border-border bg-card shadow-sm">
            <div className="p-6">
              <span className="grid size-12 place-items-center rounded-full bg-blue-soft text-accent">
                <FileText aria-hidden="true" className="size-6" />
              </span>
              <h2 className="mt-5 font-serif text-2xl font-semibold text-ink">Critical Thinking Test</h2>
              <p className="mt-3 text-lg leading-7 text-ink-muted">Make better decisions for a brighter future.</p>
              <div className="mt-8 space-y-3 border-t border-border pt-6">
                {["Test in Progress", "Your Results", "Personalized Insights"].map((label, index) => (
                  <div
                    key={label}
                    className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold ${
                      index === 0 ? "bg-blue-soft text-accent" : "text-ink-muted"
                    }`}
                  >
                    <span className={`grid size-9 place-items-center rounded-full border ${
                      index === 0 ? "border-accent bg-accent text-primary-foreground" : "border-border"
                    }`}>
                      {index + 1}
                    </span>
                    {label}
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-md bg-background p-5">
                <p className="text-sm text-ink-muted">Estimated time</p>
                <p className="mt-1 font-serif text-3xl font-semibold text-ink">~ 8 minutes</p>
                <p className="mt-1 text-sm text-ink-muted">{questions.length} questions total</p>
              </div>
            </div>
            <img
              alt="University campus walkway"
              className="h-72 w-full object-cover"
              src={campusImage}
            />
          </div>
        </aside>

        <form
          className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-8 lg:p-10"
          onSubmit={(event) => {
            event.preventDefault();
            onContinue(false);
          }}
        >
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
            <span className="inline-flex items-center gap-3 rounded-full bg-blue-soft px-4 py-2 text-sm font-bold text-accent">
              <BarChart3 aria-hidden="true" className="size-5" />
              {getQuestionTheme(currentIndex)}
            </span>
            <span className="text-sm font-semibold text-ink-muted">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          <h1
            ref={headingRef}
            tabIndex={-1}
            className={`whitespace-pre-line font-serif font-semibold text-ink outline-none ${
              hasLongPrompt
                ? "text-xl leading-8"
                : "text-2xl leading-9"
            }`}
          >
            {question.stem}
          </h1>

          {question.choices && (
            <fieldset className="mt-8">
              <legend className="sr-only">Choose one answer</legend>
              <RadioGroup
                className="gap-4"
                value={answer.choice ?? ""}
                onValueChange={(choice) =>
                  onAnswer({
                    choice,
                    explanation:
                      question.responseType === "multiple-choice" ? "" : answer.explanation,
                  })
                }
                aria-describedby={`${question.id}-choice-help${confirmIncomplete && !answer.choice ? ` ${question.id}-incomplete` : ""}`}
              >
                {question.choices.map((choice) => {
                  const selected = answer.choice === choice.label;
                  return (
                    <Label
                      key={choice.label}
                      htmlFor={`${question.id}-${choice.label}`}
                      className={`flex min-h-20 cursor-pointer items-center gap-5 rounded-md border px-5 py-4 text-lg font-normal leading-8 transition-colors ${
                        selected
                          ? "border-accent bg-blue-soft text-ink shadow-[0_0_0_1px_var(--accent)]"
                          : "border-border bg-card text-ink hover:border-accent/50 hover:bg-background"
                      }`}
                    >
                      <RadioGroupItem
                        id={`${question.id}-${choice.label}`}
                        value={choice.label}
                        className="sr-only"
                      />
                      <span
                        className={`grid size-12 shrink-0 place-items-center rounded-full border font-serif text-xl font-semibold ${
                          selected
                            ? "border-accent bg-accent text-primary-foreground"
                            : "border-border bg-background text-ink"
                        }`}
                      >
                        {choice.label}
                      </span>
                      <span>{choice.text}</span>
                    </Label>
                  );
                })}
              </RadioGroup>
              <p id={`${question.id}-choice-help`} className="sr-only">
                Select one answer using the radio buttons.
              </p>
            </fieldset>
          )}

          {requiresExplanation && (
            <section className="mt-8 rounded-md border border-gold/35 bg-gold-soft/70 p-5" aria-labelledby={`${question.id}-reasoning-label`}>
              <div className="flex gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gold-soft text-gold">
                  <Lightbulb aria-hidden="true" className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <Label
                    id={`${question.id}-reasoning-label`}
                    htmlFor={`${question.id}-explanation`}
                    className="block font-serif text-xl font-semibold text-ink"
                  >
                    Why did you choose this?
                    <span className="font-sans text-base font-normal text-ink-muted"> Optional</span>
                  </Label>
                  <p id={`${question.id}-reasoning-help`} className="mt-1 leading-7 text-ink-muted">
                    Reflect on your reasoning. This helps build stronger thinking habits.
                  </p>
                  <Textarea
                    id={`${question.id}-explanation`}
                    value={answer.explanation}
                    onChange={(event) => onAnswer({ ...answer, explanation: event.target.value })}
                    aria-describedby={`${question.id}-reasoning-help${confirmIncomplete ? ` ${question.id}-incomplete` : ""}`}
                    placeholder="e.g., This choice is best supported because..."
                    className="mt-4 min-h-32 resize-y rounded-md border-border bg-card p-4 text-base leading-7 text-ink shadow-none focus-visible:border-accent focus-visible:ring-accent/25 md:text-base"
                  />
                  <p className="mt-2 text-right text-sm text-ink-muted">{answer.explanation.length}/600</p>
                </div>
              </div>
            </section>
          )}

          <div className="mt-5 min-h-20">
            {confirmIncomplete && (
              <Alert id={`${question.id}-incomplete`} className="rounded-md border-gold/60 bg-gold-soft text-ink">
                <CircleAlert aria-hidden="true" className="text-gold" />
                <AlertTitle>Answer incomplete</AlertTitle>
                <AlertDescription>
                  <p>{incompleteMessage}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <ActionButton
                      size="sm"
                      variant="outline"
                      onActivate={onKeepEditing}
                      className="rounded-md border-border bg-card text-ink hover:bg-background"
                    >
                      Keep editing
                    </ActionButton>
                    <ActionButton
                      size="sm"
                      onActivate={() => onContinue(true)}
                      className="rounded-md bg-primary text-primary-foreground hover:bg-accent"
                    >
                      {isFinal ? "Finish anyway" : "Continue anyway"}
                    </ActionButton>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <ActionButton
              variant="outline"
              onActivate={onBack}
              disabled={currentIndex === 0}
              className="min-h-14 rounded-md border-border bg-card px-7 text-base text-ink hover:bg-background"
            >
              <ArrowLeft aria-hidden="true" />
              Previous Question
            </ActionButton>
            <div className="flex flex-col gap-3 sm:flex-row">
              {currentIndex >= 2 && (
                <ActionButton
                  variant="outline"
                  onActivate={onSkip}
                  className="min-h-14 rounded-md border-border bg-card px-5 text-base text-ink hover:bg-background"
                >
                  <SkipForward aria-hidden="true" />
                  {isFinal ? "Skip and finish" : "Skip"}
                </ActionButton>
              )}
              <ActionButton
                onActivate={() => onContinue(false)}
                className="min-h-14 rounded-md bg-primary px-8 text-base text-primary-foreground hover:bg-accent"
              >
                {isFinal ? "Finish Test" : "Next Question"}
                {isFinal ? <Check aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
              </ActionButton>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

function ScoringScreen() {
  return (
    <main id="main-content" className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-4xl items-center px-5 py-14 sm:px-8">
        <div className="w-full rounded-md border border-border bg-card p-8 shadow-xl shadow-ink/10">
          <div className="flex items-center gap-3 text-accent" role="status" aria-live="polite">
            <Spinner className="size-5" />
            <span className="text-sm font-bold uppercase tracking-[0.18em]">Calculating your report</span>
          </div>
          <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Checking your answers and reading your written responses.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-muted">
            Multiple-choice accuracy is checked while your written reasoning is
            evaluated against the rubric.
          </p>
        </div>
      </section>
    </main>
  );
}

function ReportAccessForm({ onUnlocked }: { onUnlocked: () => void }) {
  const [email, setEmail] = useState("");
  const [productUpdatesConsent, setProductUpdatesConsent] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!ageConfirmed) {
      setStatus("error");
      setMessage("Email collection is currently limited to people who confirm they are at least 18.");
      return;
    }

    setStatus("submitting");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          betaConsent: productUpdatesConsent,
          ageConfirmed,
        }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setStatus("error");
        setMessage(payload?.message ?? "Email saving is not active right now. Your address was not saved.");
        return;
      }

      onUnlocked();
    } catch {
      setStatus("error");
      setMessage("Email saving is not active right now. Your address was not saved.");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-md border border-border bg-card p-6 shadow-sm">
      <div>
        <Label htmlFor="report-email" className="text-base font-semibold text-ink">Email address</Label>
        <Input
          id="report-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          aria-describedby="report-email-purpose"
          className="mt-2 h-12 rounded-md border-border bg-background px-4 text-base text-ink shadow-none focus-visible:border-accent focus-visible:ring-accent/25 md:text-base"
        />
        <p id="report-email-purpose" className="mt-2 text-sm leading-6 text-ink-muted">
          Save your address to open the full report in this browser. The report is not emailed.
        </p>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="product-updates-consent"
          checked={productUpdatesConsent}
          onCheckedChange={(value) => setProductUpdatesConsent(value === true)}
          className="mt-1 border-border data-[state=checked]:border-accent data-[state=checked]:bg-accent"
        />
        <Label htmlFor="product-updates-consent" className="block text-sm font-normal leading-6 text-ink-muted">
          Email me about product updates.
          <span className="block text-xs">Optional and not required to view the report.</span>
        </Label>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="report-age"
          checked={ageConfirmed}
          onCheckedChange={(value) => setAgeConfirmed(value === true)}
          className="mt-1 border-border data-[state=checked]:border-accent data-[state=checked]:bg-accent"
        />
        <Label htmlFor="report-age" className="block text-sm font-normal leading-6 text-ink-muted">
          I confirm that I am at least 18 years old. This check is not stored.
        </Label>
      </div>

      <Button
        type="submit"
        disabled={status === "submitting"}
        className="h-auto min-h-12 w-full whitespace-normal rounded-md bg-primary px-5 py-3 text-base text-primary-foreground hover:bg-accent"
      >
        {status === "submitting" ? <Spinner /> : <LockKeyhole aria-hidden="true" />}
        {status === "submitting" ? "Saving email..." : "Save email and view full report"}
      </Button>

      <div aria-live="polite" className="min-h-6">
        {status === "error" && <p className="text-sm font-semibold text-destructive">{message}</p>}
      </div>
    </form>
  );
}

function ReportPreview({
  report,
  onRestart,
  onUnlocked,
}: {
  report: AssessmentReport;
  onRestart: () => void;
  onUnlocked: () => void;
}) {
  const overallScore = getOverallScore(report);

  return (
    <main id="main-content" className="min-h-screen bg-background">
      <SiteHeader active="My Results" actionLabel="Take Another Test" onAction={onRestart} />

      <section className="relative overflow-hidden border-b border-border">
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-55 lg:block"
          src={campusImage}
        />
        <div className="absolute inset-y-0 right-0 hidden w-2/3 bg-gradient-to-r from-background via-background/90 to-transparent lg:block" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="eyebrow">Your results</p>
            <h1 className="mt-3 max-w-3xl font-serif text-5xl font-semibold leading-[0.98] text-ink sm:text-6xl">
              A stronger, more analytical you.
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-8 text-ink-muted">
              Here is your personalized preview from the ThinkBetter critical
              thinking test, along with insights and next steps to help you keep growing.
            </p>
            <div className="mt-5 flex flex-wrap gap-6 text-sm font-semibold text-ink-muted">
              <span className="inline-flex items-center gap-2">
                <CalendarDays aria-hidden="true" className="size-4 text-accent" />
                Completed today
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 aria-hidden="true" className="size-4 text-accent" />
                about 8 minutes
              </span>
            </div>
          </div>

          <aside className="rounded-md border border-gold/50 bg-card/95 p-6 shadow-xl shadow-ink/10">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gold">
              <Medal aria-hidden="true" className="size-5" />
              Go further
            </p>
            <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight text-ink">
              Get Your Full Analysis Report
            </h2>
            <p className="mt-4 leading-7 text-ink-muted">
              Unlock the detailed breakdown of your results, learning plan, and
              practice recommendations.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-ink-muted">
              {["In-depth skill analysis", "Personalized study recommendations", "Practical exercises and resources"].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 aria-hidden="true" className="size-5 text-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-md border border-border bg-card p-6 shadow-sm">
          <p className="font-serif text-2xl font-semibold text-ink">Your Overall Score</p>
          <div className="mt-6 grid gap-8 md:grid-cols-[14rem_1fr] md:items-center">
            <div className="relative mx-auto grid size-44 place-items-center rounded-full bg-secondary">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(var(--accent) ${overallScore * 3.6}deg, var(--secondary) 0deg)`,
                }}
              />
              <div className="relative grid size-32 place-items-center rounded-full bg-card text-center">
                <span className="font-serif text-5xl font-semibold text-ink">{overallScore}</span>
                <span className="-mt-5 text-sm text-ink-muted">out of 100</span>
              </div>
            </div>
            <div>
              <h2 className="font-serif text-4xl font-semibold text-ink">{getScoreLabel(overallScore)}</h2>
              <p className="mt-3 text-lg leading-8 text-ink-muted">
                Your preview is based on the answers in this session. The full report
                keeps multiple-choice accuracy and written reasoning separate.
              </p>
              <div className="mt-5 rounded-md bg-blue-soft p-4 text-sm text-ink">
                <BarChart3 aria-hidden="true" className="mb-2 size-5 text-accent" />
                MCQ score: {report.mcqAccuracy.score}/{report.mcqAccuracy.maximumScore}
                {" "}and written reasoning: {report.writtenReasoning.score}/{report.writtenReasoning.maximumScore}.
              </div>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {report.previewObservations.map((observation, index) => (
              <article key={observation} className="rounded-md border border-border bg-background p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Observation {index + 1}</p>
                <p className="mt-3 leading-7 text-ink-muted">{observation}</p>
              </article>
            ))}
          </div>
        </div>

        <div>
          <ReportAccessForm onUnlocked={onUnlocked} />
          <Alert className="mt-5 rounded-md border-border bg-card text-ink">
            <CircleAlert aria-hidden="true" className="text-accent" />
            <AlertTitle>What this assessment can say</AlertTitle>
            <AlertDescription>
              <p>
                The result describes performance on this question set. It is not
                validated for admissions, employment, clinical decisions, or placement.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-7xl px-5 pb-8 sm:px-8">
        <ActionButton
          variant="outline"
          onActivate={onRestart}
          className="rounded-md border-border bg-card text-ink hover:bg-background"
        >
          Start over
        </ActionButton>
      </div>
      <SiteFooter />
    </main>
  );
}

function FullReport({
  report,
  isDemo,
  onRestart,
}: {
  report: AssessmentReport;
  isDemo: boolean;
  onRestart: () => void;
}) {
  const overallScore = getOverallScore(report);
  const mcqPercent = summaryPercent(report.mcqAccuracy) ?? 0;
  const writtenPercent = summaryPercent(report.writtenReasoning) ?? 0;
  const mcqNotRated = report.mcqAccuracy.totalItems - report.mcqAccuracy.ratedItems;
  const writtenNotRated = report.writtenReasoning.totalItems - report.writtenReasoning.ratedItems;

  return (
    <main id="main-content" className="min-h-screen bg-background">
      <SiteHeader active="My Results" actionLabel="Take Another Test" onAction={onRestart} />

      <section className="relative overflow-hidden border-b border-border">
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-55 lg:block"
          src={campusImage}
        />
        <div className="absolute inset-y-0 right-0 hidden w-2/3 bg-gradient-to-r from-background via-background/90 to-transparent lg:block" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="eyebrow">Your results</p>
            <h1 className="mt-3 max-w-3xl font-serif text-5xl font-semibold leading-[0.98] text-ink sm:text-6xl">
              A stronger, more analytical you.
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-8 text-ink-muted">
              Here is your personalized ThinkBetter report with your scores,
              evidence from your answers, and next steps.
            </p>
            <div className="mt-5 flex flex-wrap gap-6 text-sm font-semibold text-ink-muted">
              <span className="inline-flex items-center gap-2">
                <CalendarDays aria-hidden="true" className="size-4 text-accent" />
                Completed today
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 aria-hidden="true" className="size-4 text-accent" />
                about 8 minutes
              </span>
            </div>
          </div>
          <Alert className="self-start rounded-md border-accent/30 bg-blue-soft text-ink">
            <Check aria-hidden="true" className="text-accent" />
            <AlertTitle>{isDemo ? "Demo report with sample data" : "Your full report is open"}</AlertTitle>
            <AlertDescription>
              <p>
                {isDemo
                  ? "Explore every section now, then take the assessment whenever you are ready for your own results."
                  : "Your detailed results and recommendations are ready below."}
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-md border border-border bg-card p-6 shadow-sm">
          <p className="font-serif text-2xl font-semibold text-ink">Your Overall Score</p>
          <div className="mt-6 grid gap-8 md:grid-cols-[14rem_1fr] md:items-center">
            <div className="relative mx-auto grid size-44 place-items-center rounded-full bg-secondary">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(var(--accent) ${overallScore * 3.6}deg, var(--secondary) 0deg)`,
                }}
              />
              <div className="relative grid size-32 place-items-center rounded-full bg-card text-center">
                <span className="font-serif text-5xl font-semibold text-ink">{overallScore}</span>
                <span className="-mt-5 text-sm text-ink-muted">out of 100</span>
              </div>
            </div>
            <div>
              <h2 className="font-serif text-4xl font-semibold text-ink">{getScoreLabel(overallScore)}</h2>
              <p className="mt-3 text-lg leading-8 text-ink-muted">
                These results describe this session. Multiple-choice accuracy and
                written reasoning are reported separately so the feedback stays honest.
              </p>
              <div className="mt-5 grid gap-3">
                <StatBar label="MCQ accuracy" value={mcqPercent} />
                <StatBar label="Written reasoning" value={writtenPercent} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-gold/50 bg-card p-6 shadow-sm">
          <p className="font-serif text-2xl font-semibold text-ink">How You Compare</p>
          <div className="mt-6 space-y-4">
            <StatBar label="Your score" value={overallScore} />
            <StatBar label="MCQ score" value={mcqPercent} />
            <StatBar label="Written score" value={writtenPercent} />
          </div>
          <p className="mt-5 text-sm leading-6 text-ink-muted">
            {mcqNotRated === 0
              ? `${report.mcqAccuracy.ratedItems} of ${report.mcqAccuracy.totalItems} multiple-choice questions answered.`
              : `${report.mcqAccuracy.ratedItems} of ${report.mcqAccuracy.totalItems} multiple-choice questions answered; ${mcqNotRated} not rated.`}
          </p>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            {writtenNotRated === 0
              ? `${report.writtenReasoning.ratedItems} of ${report.writtenReasoning.totalItems} written items rated.`
              : `${report.writtenReasoning.ratedItems} of ${report.writtenReasoning.totalItems} written items rated; ${writtenNotRated} not rated.`}
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-10 sm:px-8">
        <div className="flex flex-wrap items-end gap-3">
          <h2 className="font-serif text-4xl font-semibold text-ink">Skill Breakdown</h2>
          <p className="pb-1 text-sm text-ink-muted">See how your answers map to critical-thinking habits.</p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {report.aspects.map((aspect, index) => {
            const Icon = skillIcons[index % skillIcons.length];
            const coverage = aspect.evidenceSufficient ? 78 - index * 4 : 42;
            return (
              <article key={aspect.title} className="rounded-md border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-blue-soft text-accent">
                    <Icon aria-hidden="true" className="size-6" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-serif text-lg font-semibold leading-6 text-ink">{aspect.title}</h3>
                    <p className="mt-1 text-xs font-semibold text-ink-muted">{aspect.questionIds.join(", ")}</p>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
                  <span
                    className="block h-full rounded-full bg-accent"
                    style={{ width: `${coverage}%` }}
                  />
                </div>
                <p className="mt-4 text-sm leading-6 text-ink-muted">{aspect.summary}</p>
                <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                  aspect.evidenceSufficient
                    ? "bg-green-soft text-green-ink"
                    : "bg-gold-soft text-gold-ink"
                }`}>
                  {aspect.evidenceSufficient ? "Strength" : "Growth Opportunity"}
                </span>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 pb-10 sm:px-8 lg:grid-cols-2">
        <div className="rounded-md border border-gold/40 bg-gold-soft/70 p-6">
          <div className="flex gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gold-soft text-gold">
              <Lightbulb aria-hidden="true" className="size-6" />
            </span>
            <div>
              <h2 className="font-serif text-2xl font-semibold text-ink">Your Key Takeaways</h2>
              <div className="mt-5 grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-ink">Your Strengths</p>
                  <ul className="mt-3 space-y-3">
                    {report.demonstratedStrengths.length ? report.demonstratedStrengths.map((strength) => (
                      <li key={strength} className="flex gap-2 text-sm leading-6 text-ink-muted">
                        <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-green-ink" />
                        {strength}
                      </li>
                    )) : <li className="text-sm leading-6 text-ink-muted">The submitted answers did not provide enough evidence for a reliable strength statement.</li>}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-ink">Areas to Improve</p>
                  <ul className="mt-3 space-y-3">
                    {report.nextSteps.length ? report.nextSteps.map((step) => (
                      <li key={step} className="flex gap-2 text-sm leading-6 text-ink-muted">
                        <ArrowRight aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-gold" />
                        {step}
                      </li>
                    )) : <li className="text-sm leading-6 text-ink-muted">More response evidence is needed before suggesting a specific next step.</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-blue-soft text-accent">
                <Target aria-hidden="true" className="size-6" />
              </span>
              <div>
                <h2 className="font-serif text-2xl font-semibold text-ink">Personalized Next Steps</h2>
                <p className="mt-1 text-sm leading-6 text-ink-muted">
                  Based on your results, here are tailored recommendations to help you keep improving.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {report.aspects.slice(0, 3).map((aspect) => (
              <article key={aspect.title} className="rounded-md border border-border bg-background p-4">
                <p className="font-serif text-lg font-semibold leading-6 text-ink">{aspect.title}</p>
                <p className="mt-2 text-sm leading-6 text-ink-muted">{aspect.practiceOpportunity}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Assessment confidence</p>
            <p className="mt-4 font-serif text-3xl font-semibold capitalize text-ink">{report.confidence}</p>
            <p className="mt-3 leading-7 text-ink-muted">{report.confidenceReason}</p>
          </div>
          <div className="border-l-2 border-accent pl-5">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Keep the result in scope</p>
            <p className="mt-3 leading-7 text-ink-muted">
              This report covers one assessment session. It does not prove change
              over time or compare you with other test takers.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-7xl px-5 py-8 sm:px-8">
        <ActionButton
          variant="outline"
          onActivate={onRestart}
          className="rounded-md border-border bg-card text-ink hover:bg-background"
        >
          Start over
        </ActionButton>
      </div>
      <SiteFooter />
    </main>
  );
}

export function AssessmentExperience() {
  const [view, setView] = useState<View>("landing");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<QuestionId, AssessmentAnswer>>(() => emptyAnswers());
  const [confirmIncomplete, setConfirmIncomplete] = useState(false);
  const [report, setReport] = useState<AssessmentReport | null>(null);
  const [reportIsDemo, setReportIsDemo] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const completionRecordedRef = useRef(false);
  const toolStateRef = useRef({ view, currentIndex });
  const startRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    toolStateRef.current = { view, currentIndex };
  }, [view, currentIndex]);

  useEffect(() => {
    if (view !== "assessment") return;
    window.scrollTo({ top: 0, behavior: "instant" });
    window.requestAnimationFrame(() => headingRef.current?.focus());
  }, [view, currentIndex]);

  const startAssessment = useCallback(() => {
    setAnswers(emptyAnswers());
    setCurrentIndex(0);
    setConfirmIncomplete(false);
    setReport(null);
    setReportIsDemo(false);
    completionRecordedRef.current = false;
    setView("assessment");
    void recordEvent("test_started");
  }, []);

  useEffect(() => {
    startRef.current = startAssessment;
  }, [startAssessment]);

  const showDemoReport = useCallback(() => {
    setReport(demoAssessmentReport);
    setReportIsDemo(true);
    setView("report");
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;

    const lifecycle = new AbortController();
    const options = { signal: lifecycle.signal };
    const schema = { type: "object", properties: {}, additionalProperties: false };
    const registrations = [
      context.registerTool(
        {
          name: "start_assessment",
          title: "Start assessment",
          description:
            "Start the critical-thinking self-assessment and show its first question. This never supplies or submits an answer.",
          inputSchema: schema,
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute(input) {
            assertEmptyToolInput(input);
            startRef.current();
            return { status: "started", question: 1, totalQuestions: questions.length };
          },
        },
        options,
      ),
      context.registerTool(
        {
          name: "get_assessment_progress",
          title: "Get assessment progress",
          description:
            "Read the visible assessment stage and question number without reading any response text.",
          inputSchema: schema,
          annotations: { readOnlyHint: true, untrustedContentHint: false },
          execute(input) {
            assertEmptyToolInput(input);
            const state = toolStateRef.current;
            return {
              stage: state.view,
              question: state.view === "assessment" ? state.currentIndex + 1 : null,
              totalQuestions: questions.length,
            };
          },
        },
        options,
      ),
    ];

    for (const registration of registrations) {
      void Promise.resolve(registration).catch(() => undefined);
    }

    return () => lifecycle.abort();
  }, []);

  async function calculateReport(
    submittedAnswers: Record<QuestionId, AssessmentAnswer> = answers,
  ) {
    setView("scoring");

    if (!completionRecordedRef.current) {
      completionRecordedRef.current = true;
      void recordEvent("test_completed");
    }

    try {
      const response = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: questionIds.map((questionId) => ({
            questionId,
            ...submittedAnswers[questionId],
          })),
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        report?: AssessmentReport;
        message?: string;
      } | null;

      if (!response.ok || !payload?.report) {
        showDemoReport();
        return;
      }

      setReport(payload.report);
      setReportIsDemo(false);
      setView("preview");
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch {
      showDemoReport();
    }
  }

  function handleAnswer(answer: AssessmentAnswer) {
    const questionId = questions[currentIndex].id;
    setAnswers((current) => ({ ...current, [questionId]: answer }));
    setConfirmIncomplete(false);
  }

  function handleBack() {
    if (currentIndex === 0) return;
    setConfirmIncomplete(false);
    setCurrentIndex((index) => index - 1);
  }

  function handleSkip() {
    const questionId = questions[currentIndex].id;
    const nextAnswers = {
      ...answers,
      [questionId]: { choice: null, explanation: "" },
    };

    setAnswers(nextAnswers);
    setConfirmIncomplete(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    void calculateReport(nextAnswers);
  }

  function handleContinue(force: boolean) {
    const question = questions[currentIndex];
    const answer = answers[question.id];
    const incomplete =
      question.responseType === "multiple-choice"
        ? !answer.choice
        : question.responseType === "choice-and-explanation"
          ? !answer.choice || !answer.explanation.trim()
          : !answer.explanation.trim();

    if (incomplete && !force) {
      setConfirmIncomplete(true);
      return;
    }

    setConfirmIncomplete(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    void calculateReport();
  }

  if (view === "assessment") {
    const questionId = questions[currentIndex].id;
    return (
      <Assessment
        answer={answers[questionId]}
        currentIndex={currentIndex}
        confirmIncomplete={confirmIncomplete}
        headingRef={headingRef}
        onAnswer={handleAnswer}
        onBack={handleBack}
        onContinue={handleContinue}
        onKeepEditing={() => setConfirmIncomplete(false)}
        onSkip={handleSkip}
      />
    );
  }

  if (view === "scoring") {
    return <ScoringScreen />;
  }

  if (view === "preview" && report) {
    return (
      <ReportPreview
        report={report}
        onRestart={startAssessment}
        onUnlocked={() => {
          setView("report");
          window.scrollTo({ top: 0, behavior: "instant" });
        }}
      />
    );
  }

  if (view === "report" && report) {
    return (
      <FullReport
        report={report}
        isDemo={reportIsDemo}
        onRestart={startAssessment}
      />
    );
  }

  return <Landing onStart={startAssessment} onViewReport={showDemoReport} />;
}
