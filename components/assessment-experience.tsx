"use client";

import {
  BookOpenCheck,
  Check,
  CircleAlert,
  FileText,
  Lightbulb,
  LockKeyhole,
  Play,
  RotateCcw,
  SearchCheck,
  ShieldCheck,
  SkipForward,
  Target,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

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
  emptyAnswers,
  questionIds,
  questions,
} from "@/lib/assessment";

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

function Brand({ href = "/" }: { href?: string }) {
  return (
    <a
      className="inline-flex min-w-0 items-center font-serif text-lg font-semibold text-ink outline-none focus-visible:ring-3 focus-visible:ring-accent/45"
      href={href}
    >
      <span className="truncate">thinkbetter</span>
    </a>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-ink/15 bg-paper-deep/50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>A practical critical-thinking assessment for learning and reflection.</p>
        <nav aria-label="Legal" className="flex gap-5">
          <a className="underline decoration-ink/30 underline-offset-4 hover:text-accent" href="/privacy">
            Privacy
          </a>
          <a className="underline decoration-ink/30 underline-offset-4 hover:text-accent" href="/terms">
            Terms
          </a>
        </nav>
      </div>
    </footer>
  );
}

function Landing({ onStart }: { onStart: () => void }) {
  const benefits = [
    {
      icon: SearchCheck,
      label: "01",
      title: "Answer practical questions",
      copy: "Work through 10 multiple-choice and 6 written questions about claims, evidence, and decisions.",
    },
    {
      icon: Target,
      label: "02",
      title: "Get two clear results",
      copy: "See your multiple-choice accuracy and a separate score for the reasoning in your written answers.",
    },
    {
      icon: BookOpenCheck,
      label: "03",
      title: "Know what to practise",
      copy: "Get focused feedback on assumptions, evidence, alternatives, competing explanations, and uncertainty.",
    },
  ];
  const reportFeatures = [
    {
      icon: Check,
      title: "MCQ accuracy",
      copy: "See how many of the multiple-choice questions you answered correctly.",
    },
    {
      icon: FileText,
      title: "Written-reasoning score",
      copy: "See a separate rubric-based result for the six questions that ask you to explain your thinking.",
    },
    {
      icon: SearchCheck,
      title: "Evidence from your answers",
      copy: "Understand what your responses showed across five useful feedback areas.",
    },
    {
      icon: Target,
      title: "Practical next steps",
      copy: "Leave with specific ways to strengthen how you examine claims and make decisions.",
    },
  ];

  return (
    <main id="main-content" className="min-h-screen overflow-hidden">
      <header className="border-b border-ink/15 bg-paper/95">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Brand href="#top" />
          <nav aria-label="Main" className="hidden gap-5 text-sm text-ink-muted sm:flex">
            <a className="hover:text-accent" href="#how-it-works">How it works</a>
            <a className="hover:text-accent" href="/privacy">Privacy</a>
            <a className="hover:text-accent" href="/terms">Terms</a>
          </nav>
        </div>
      </header>

      <section id="top" className="relative border-b border-ink/15">
        <div className="notebook-rule" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[min(38rem,calc(100svh-10rem))] w-full max-w-6xl items-center px-5 py-12 sm:px-8 lg:py-16">
          <div className="max-w-4xl">
            <p className="mb-4 text-sm font-semibold uppercase text-accent">
              thinkbetter
            </p>
            <h1 className="balance font-serif text-5xl font-semibold leading-[1.04] text-ink sm:text-6xl lg:text-7xl">
              Test your critical thinking.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-ink-muted sm:text-xl">
              Answer 16 questions about everyday claims, evidence, and uncertainty.
              Get a clear report with your results, feedback on your answers, and
              practical next steps.
            </p>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-ink-muted">
              <span className="inline-flex items-center gap-2">
                <FileText aria-hidden="true" className="size-4 text-accent" />
                16 questions
              </span>
              <span className="inline-flex items-center gap-2">
                <SearchCheck aria-hidden="true" className="size-4 text-accent" />
                Two clear results
              </span>
              <span className="inline-flex items-center gap-2">
                <Target aria-hidden="true" className="size-4 text-accent" />
                Personal feedback
              </span>
            </div>

            <Button
              className="mt-8 min-h-12 rounded-[4px] bg-ink px-5 text-base text-paper hover:bg-accent"
              size="lg"
              onClick={onStart}
            >
              <Play aria-hidden="true" className="size-4 fill-current" />
              Start the assessment
            </Button>
            <p className="mt-3 text-sm leading-6 text-ink-muted">
              No account or email is needed to start.
            </p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-6 border-b border-ink/15 bg-sheet">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 lg:py-18">
          <p className="annotation-label">What you get</p>
          <h2 className="mt-4 max-w-2xl font-serif text-4xl font-semibold text-ink sm:text-5xl">
            A useful result, not just a final number
          </h2>
          <div className="mt-10 grid border-y border-ink/15 md:grid-cols-3">
            {benefits.map(({ icon: Icon, label, title, copy }, index) => (
              <article
                key={title}
                className={`py-7 md:px-6 ${index > 0 ? "border-t border-ink/15 md:border-l md:border-t-0" : ""}`}
              >
                <div className="flex items-center justify-between gap-4 text-accent">
                  <Icon aria-hidden="true" className="size-5" />
                  <span className="font-mono text-xs">{label}</span>
                </div>
                <h3 className="mt-5 font-serif text-2xl font-semibold text-ink">{title}</h3>
                <p className="mt-3 leading-7 text-ink-muted">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-ink/15">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 lg:py-18">
          <p className="annotation-label">Inside your report</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <h2 className="font-serif text-4xl font-semibold text-ink sm:text-5xl">
              See what your answers show
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-ink-muted">
              After the assessment, you will see a short preview. Save your email
              address to open the full report in this browser; the report is not emailed.
            </p>
          </div>
          <div className="mt-10 grid border-y border-ink/15 sm:grid-cols-2">
            {reportFeatures.map(({ icon: Icon, title, copy }, index) => (
              <article
                key={title}
                className={`py-7 sm:px-6 ${index > 0 ? "border-t border-ink/15" : ""} ${index === 1 ? "sm:border-t-0" : ""} ${index % 2 === 1 ? "sm:border-l" : ""}`}
              >
                <Icon aria-hidden="true" className="size-5 text-accent" />
                <h3 className="mt-4 font-serif text-2xl font-semibold text-ink">{title}</h3>
                <p className="mt-2 leading-7 text-ink-muted">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-ink/15 bg-paper-deep/35">
        <div className="mx-auto flex w-full max-w-6xl gap-4 px-5 py-12 sm:px-8">
          <ShieldCheck aria-hidden="true" className="mt-1 size-6 shrink-0 text-accent" />
          <div className="max-w-3xl">
            <h2 className="font-serif text-2xl font-semibold text-ink">Purpose and privacy</h2>
            <p className="mt-2 leading-7 text-ink-muted">
              This is a learning and self-reflection tool, not a clinical,
              intelligence, admissions, employment, or placement test. Answers
              are used to calculate the report and are not added to analytics or
              the email record.
            </p>
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
  headingRef: React.RefObject<HTMLHeadingElement | null>;
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
  const incompleteMessage =
    question.responseType === "multiple-choice"
      ? "No option is selected. If you continue, this question will be marked not rated rather than incorrect."
      : !answer.choice && !answer.explanation.trim()
        ? "This question has no answer. If you continue, it will be marked not rated rather than incorrect."
        : !answer.choice && question.responseType === "choice-and-explanation"
          ? "No option is selected. You can continue, but the written-reasoning score will reflect only the explanation you submitted."
          : "Your written reasoning is blank. You can continue, but the score for this item will reflect only the option you selected.";

  return (
    <main id="main-content" className="min-h-screen bg-paper">
      <header className="sticky top-0 z-10 border-b border-ink/15 bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center justify-between gap-5">
            <Brand href="/" />
            <p aria-live="polite" className="shrink-0 text-sm font-semibold text-ink-muted">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <Progress
            value={progress}
            aria-label={`Assessment progress: question ${currentIndex + 1} of ${questions.length}`}
            className="h-1.5 rounded-none bg-ink/15 [&_[data-slot=progress-indicator]]:bg-accent"
          />
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl px-5 py-9 sm:px-8 sm:py-12">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onContinue(false);
          }}
        >
          <p className="annotation-label">{question.id}</p>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-6 whitespace-pre-line font-serif text-3xl font-semibold leading-[1.35] text-ink outline-none sm:text-4xl"
          >
            {question.stem}
          </h1>

          {question.choices && (
            <fieldset className="mt-9">
              <legend className="text-sm font-semibold uppercase text-ink-muted">Choose one</legend>
              <RadioGroup
                className="mt-3 gap-3"
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
                      className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-[4px] border px-4 py-3 text-base font-normal leading-7 transition-colors ${
                        selected
                          ? "border-accent bg-accent-soft/60 text-ink"
                          : "border-ink/20 bg-sheet text-ink-muted hover:border-ink/40 hover:text-ink"
                      }`}
                    >
                      <RadioGroupItem
                        id={`${question.id}-${choice.label}`}
                        value={choice.label}
                        className="mt-1 border-ink/45 text-accent data-[state=checked]:border-accent [&_[data-slot=radio-group-indicator]>svg]:fill-accent"
                      />
                      <span>
                        <span className="mr-2 font-semibold text-ink">{choice.label}.</span>
                        {choice.text}
                      </span>
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
            <section className="mt-9" aria-labelledby={`${question.id}-reasoning-label`}>
              <Label
                id={`${question.id}-reasoning-label`}
                htmlFor={`${question.id}-explanation`}
                className="block font-serif text-2xl leading-8 text-ink"
              >
                Your reasoning
              </Label>
              <p id={`${question.id}-reasoning-help`} className="mt-2 leading-7 text-ink-muted">
                {question.responseType === "choice-and-explanation"
                  ? "Explain your reasoning."
                  : "Use ordinary language and focus on how you reached your conclusion."}
              </p>
              <Textarea
                id={`${question.id}-explanation`}
                value={answer.explanation}
                onChange={(event) => onAnswer({ ...answer, explanation: event.target.value })}
                aria-describedby={`${question.id}-reasoning-help${confirmIncomplete ? ` ${question.id}-incomplete` : ""}`}
                placeholder="Write your reasoning..."
                className="mt-4 min-h-44 resize-y rounded-[4px] border-ink/30 bg-sheet p-4 text-base leading-7 text-ink shadow-none focus-visible:border-accent focus-visible:ring-accent/25 md:text-base"
              />
            </section>
          )}

          <div className="mt-5 min-h-20">
            {confirmIncomplete && (
              <Alert id={`${question.id}-incomplete`} className="rounded-[4px] border-accent/45 bg-accent-soft/35 text-ink">
                <CircleAlert aria-hidden="true" className="text-accent" />
                <AlertTitle>Answer incomplete</AlertTitle>
                <AlertDescription>
                  <p>{incompleteMessage}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={onKeepEditing}
                      className="rounded-[4px] border-ink/30 bg-sheet text-ink hover:bg-paper-deep"
                    >
                      Keep editing
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onContinue(true)}
                      className="rounded-[4px] bg-ink text-paper hover:bg-accent"
                    >
                      {isFinal ? "Finish anyway" : "Continue anyway"}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-ink/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={currentIndex === 0}
              className="min-h-11 rounded-[4px] border-ink/30 bg-transparent px-4 text-ink hover:bg-paper-deep"
            >
              Back
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row">
              {currentIndex >= 2 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSkip}
                  className="min-h-11 rounded-[4px] border-ink/30 bg-transparent px-4 text-ink hover:bg-paper-deep"
                >
                  <SkipForward aria-hidden="true" />
                  {isFinal ? "Skip and finish" : "Skip question"}
                </Button>
              )}
              <Button
                type="submit"
                className="min-h-11 rounded-[4px] bg-ink px-5 text-paper hover:bg-accent"
              >
                {isFinal ? (
                  <>
                    <Check aria-hidden="true" />
                    Finish assessment
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

function ScoringScreen({
  status,
  message,
  onBack,
  onRetry,
}: {
  status: "loading" | "error";
  message: string;
  onBack: () => void;
  onRetry: () => void;
}) {
  const loading = status === "loading";

  return (
    <main id="main-content" className="min-h-screen">
      <header className="border-b border-ink/15 bg-paper/95">
        <div className="mx-auto flex min-h-16 w-full max-w-4xl items-center px-5 py-3 sm:px-8">
          <Brand />
        </div>
      </header>
      <section className="mx-auto flex min-h-[calc(100svh-8rem)] w-full max-w-3xl items-center px-5 py-14 sm:px-8">
        <div className="w-full border-l-2 border-accent pl-6 sm:pl-9">
          {loading ? (
            <>
              <div className="flex items-center gap-3 text-accent" role="status" aria-live="polite">
                <Spinner className="size-5" />
                <span className="text-sm font-semibold uppercase">Calculating your report</span>
              </div>
              <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
                Checking your answers and reading your written responses
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-muted">
                Multiple-choice accuracy is being checked while your written reasoning is
                evaluated against the rubric. There is no artificial waiting period.
              </p>
            </>
          ) : (
            <Alert variant="destructive" className="rounded-[4px] border-destructive/40 bg-sheet p-5">
              <CircleAlert aria-hidden="true" />
              <AlertTitle className="text-lg">Your report is not ready yet</AlertTitle>
              <AlertDescription>
                <p>{message}</p>
                <p>Your answers remain in this browser session.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button type="button" onClick={onRetry} className="rounded-[4px] bg-ink text-paper hover:bg-accent">
                    <RotateCcw aria-hidden="true" />
                    Retry scoring
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="rounded-[4px] border-ink/30 bg-transparent text-ink hover:bg-paper-deep"
                  >
                    Return to final answer
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
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
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <Label htmlFor="report-email" className="text-base text-ink">Email address</Label>
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
          className="mt-2 h-12 rounded-[4px] border-ink/30 bg-sheet px-4 text-base text-ink shadow-none focus-visible:border-accent focus-visible:ring-accent/25 md:text-base"
        />
        <p id="report-email-purpose" className="mt-2 text-sm leading-6 text-ink-muted">
          We save your address to open the full report in this browser. The report is not emailed.
        </p>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="product-updates-consent"
          checked={productUpdatesConsent}
          onCheckedChange={(value) => setProductUpdatesConsent(value === true)}
          className="mt-1 border-ink/50 data-[state=checked]:border-accent data-[state=checked]:bg-accent"
        />
        <Label htmlFor="product-updates-consent" className="block text-sm font-normal leading-6 text-ink-muted">
          Email me about product updates. No marketing emails.
          <span className="block text-xs">Optional and not required to view the report.</span>
        </Label>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="report-age"
          checked={ageConfirmed}
          onCheckedChange={(value) => setAgeConfirmed(value === true)}
          className="mt-1 border-ink/50 data-[state=checked]:border-accent data-[state=checked]:bg-accent"
        />
        <Label htmlFor="report-age" className="block text-sm font-normal leading-6 text-ink-muted">
          I confirm that I am at least 18 years old. This check is not stored.
        </Label>
      </div>

      <Button
        type="submit"
        disabled={status === "submitting"}
        className="h-auto min-h-12 w-full whitespace-normal rounded-[4px] bg-ink px-5 py-3 text-base text-paper hover:bg-accent sm:w-auto"
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
  return (
    <main id="main-content" className="min-h-screen">
      <header className="border-b border-ink/15 bg-paper/95">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center px-5 py-3 sm:px-8">
          <Brand />
        </div>
      </header>

      <section className="border-b border-ink/15">
        <div className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
          <p className="annotation-label">Report preview</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-ink sm:text-6xl">
            A first look at the reasoning you showed
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-ink-muted">
            This preview contains two response-grounded observations. It is not the
            complete analysis or a validated measure of your general critical-thinking ability.
          </p>

          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {report.previewObservations.map((observation, index) => (
              <article key={observation} className="evidence-item min-h-40">
                <p className="text-xs font-semibold uppercase text-accent">Observation {index + 1}</p>
                <p className="mt-4 leading-7 text-ink">{observation}</p>
              </article>
            ))}
          </div>

          <Alert className="mt-7 rounded-[4px] border-ink/20 bg-paper-deep/45 text-ink">
            <CircleAlert aria-hidden="true" className="text-accent" />
            <AlertTitle>What this assessment can say</AlertTitle>
            <AlertDescription>
              <p>
                The result describes performance on this 16-question set under these
                conditions. It is not validated, normed, predictive, diagnostic, or suitable
                for admissions, employment, clinical decisions, or academic placement.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </section>

      <section className="border-b border-ink/15 bg-sheet">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:py-16">
          <div>
            <p className="annotation-label">Full report access</p>
            <h2 className="mt-4 font-serif text-3xl font-semibold text-ink sm:text-4xl">
              See MCQ accuracy, written reasoning, and five feedback areas
            </h2>
            <p className="mt-4 leading-7 text-ink-muted">
              The full report cites your responses, identifies demonstrated strengths,
              and suggests concrete practice. The five headings organize feedback; they
              are not validated numeric subscales.
            </p>
            <p className="mt-4 text-sm leading-6 text-ink-muted">
              The assessment and full report are free. No payment or card details
              are requested.
            </p>
          </div>
          <ReportAccessForm onUnlocked={onUnlocked} />
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl px-5 py-8 sm:px-8">
        <Button
          type="button"
          variant="outline"
          onClick={onRestart}
          className="rounded-[4px] border-ink/30 bg-transparent text-ink hover:bg-paper-deep"
        >
          Start over
        </Button>
      </div>
      <SiteFooter />
    </main>
  );
}

function FullReport({ report, onRestart }: { report: AssessmentReport; onRestart: () => void }) {
  const mcqNotRated = report.mcqAccuracy.totalItems - report.mcqAccuracy.ratedItems;
  const writtenNotRated = report.writtenReasoning.totalItems - report.writtenReasoning.ratedItems;

  return (
    <main id="main-content" className="min-h-screen">
      <header className="border-b border-ink/15 bg-paper/95">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center px-5 py-3 sm:px-8">
          <Brand />
        </div>
      </header>

      <section className="border-b border-ink/15">
        <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
          <Alert className="mb-9 rounded-[4px] border-accent/35 bg-accent-soft/35 text-ink">
            <Check aria-hidden="true" className="text-accent" />
            <AlertTitle>Email saved. Your full report is open.</AlertTitle>
            <AlertDescription>
              <p>No report or confirmation email has been sent.</p>
            </AlertDescription>
          </Alert>

          <div>
            <div>
              <p className="annotation-label">Full assessment report</p>
              <h1 className="mt-4 font-serif text-5xl font-semibold leading-tight text-ink sm:text-6xl">
                What these responses demonstrate
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-ink-muted">
                These results describe performance on this question set, not a pass/fail
                judgment or a definitive measure of general ability.
              </p>
            </div>

            <div className="mt-9 grid gap-px border border-ink/15 bg-ink/15 sm:grid-cols-2">
              <section className="bg-paper p-5 sm:p-6" aria-labelledby="mcq-result-title">
                <p id="mcq-result-title" className="text-sm font-semibold uppercase text-accent">
                  MCQ accuracy
                </p>
                {report.mcqAccuracy.ratedItems > 0 ? (
                  <p className="mt-2 font-serif text-5xl font-semibold text-ink">
                    {report.mcqAccuracy.score}
                    <span className="text-2xl text-ink-muted"> / {report.mcqAccuracy.maximumScore}</span>
                  </p>
                ) : (
                  <p className="mt-2 font-serif text-3xl font-semibold text-ink">No questions answered</p>
                )}
                <p className="mt-2 text-sm leading-6 text-ink-muted">
                  {mcqNotRated === 0
                    ? `${report.mcqAccuracy.ratedItems} of ${report.mcqAccuracy.totalItems} answered.`
                    : `${report.mcqAccuracy.ratedItems} of ${report.mcqAccuracy.totalItems} answered; ${mcqNotRated} not rated.`}
                </p>
              </section>

              <section className="bg-paper p-5 sm:p-6" aria-labelledby="written-result-title">
                <p id="written-result-title" className="text-sm font-semibold uppercase text-accent">
                  Written reasoning
                </p>
                {report.writtenReasoning.ratedItems > 0 ? (
                  <p className="mt-2 font-serif text-5xl font-semibold text-ink">
                    {report.writtenReasoning.score}
                    <span className="text-2xl text-ink-muted"> / {report.writtenReasoning.maximumScore}</span>
                  </p>
                ) : (
                  <p className="mt-2 font-serif text-3xl font-semibold text-ink">No items rated</p>
                )}
                <p className="mt-2 text-sm leading-6 text-ink-muted">
                  {writtenNotRated === 0
                    ? `${report.writtenReasoning.ratedItems} of ${report.writtenReasoning.totalItems} rated; maximum 24.`
                    : `${report.writtenReasoning.ratedItems} of ${report.writtenReasoning.totalItems} rated; ${writtenNotRated} not rated.`}
                </p>
              </section>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-ink-muted">
              These two results are reported separately and are not combined. Unrated items
              are not counted as incorrect or as zero.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-ink/15 bg-sheet">
        <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="annotation-label">Demonstrated strengths</p>
              <ul className="mt-5 space-y-4">
                {report.demonstratedStrengths.length ? report.demonstratedStrengths.map((strength) => (
                  <li key={strength} className="flex gap-3 leading-7 text-ink-muted">
                    <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-accent" />
                    <span>{strength}</span>
                  </li>
                )) : <li className="leading-7 text-ink-muted">The submitted answers did not provide enough evidence for a reliable strength statement.</li>}
              </ul>
            </div>
            <div>
              <p className="annotation-label">Useful next steps</p>
              <ul className="mt-5 space-y-4">
                {report.nextSteps.length ? report.nextSteps.map((step) => (
                  <li key={step} className="flex gap-3 leading-7 text-ink-muted">
                    <Target aria-hidden="true" className="mt-1 size-5 shrink-0 text-accent" />
                    <span>{step}</span>
                  </li>
                )) : <li className="leading-7 text-ink-muted">More response evidence is needed before suggesting a specific next step.</li>}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-ink/15">
        <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
          <p className="annotation-label">Five feedback areas</p>
          <p className="mt-4 max-w-3xl leading-7 text-ink-muted">
            These headings are a reporting crosswalk, not a validated five-dimension
            scoring model. They have no numeric subscores, weights, or thresholds.
          </p>

          <div className="mt-9 divide-y divide-ink/15 border-y border-ink/15">
            {report.aspects.map((aspect, index) => (
              <article key={aspect.title} className="grid gap-6 py-9 lg:grid-cols-[13rem_1fr]">
                <div>
                  <p className="font-mono text-xs text-accent">0{index + 1}</p>
                  <h2 className="mt-2 font-serif text-2xl font-semibold text-ink">{aspect.title}</h2>
                  <p className="mt-2 text-sm text-ink-muted">{aspect.questionIds.join(", ")}</p>
                </div>
                <div>
                  <p className="text-lg leading-8 text-ink-muted">{aspect.summary}</p>
                  {!aspect.evidenceSufficient && (
                    <p className="mt-4 border-l-2 border-accent pl-4 text-sm leading-6 text-ink-muted">
                      These answers provide too little evidence for a useful judgment in this area.
                    </p>
                  )}
                  {aspect.evidence.length > 0 && (
                    <div className="mt-6 space-y-4">
                      {aspect.evidence.map((evidence, evidenceIndex) => (
                        <blockquote key={`${evidence.questionId}-${evidenceIndex}`} className="border-l border-ink/25 pl-4">
                          <p className="text-sm font-semibold text-accent">{evidence.questionId}</p>
                          {evidence.excerpt && <p className="mt-1 font-serif text-lg text-ink">“{evidence.excerpt}”</p>}
                          <p className="mt-2 text-sm leading-6 text-ink-muted">{evidence.observation}</p>
                        </blockquote>
                      ))}
                    </div>
                  )}
                  <div className="mt-6 flex gap-3 bg-paper-deep/45 px-4 py-4">
                    <Lightbulb aria-hidden="true" className="mt-1 size-5 shrink-0 text-accent" />
                    <div>
                      <p className="text-sm font-semibold text-ink">Practice opportunity</p>
                      <p className="mt-1 text-sm leading-6 text-ink-muted">{aspect.practiceOpportunity}</p>
                    </div>
                  </div>
                  {aspect.caveat && <p className="mt-4 text-sm leading-6 text-ink-muted">{aspect.caveat}</p>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-ink/15 bg-paper-deep/35">
        <div className="mx-auto grid w-full max-w-5xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-2">
          <div>
            <p className="annotation-label">Assessment confidence</p>
            <p className="mt-4 font-serif text-3xl font-semibold capitalize text-ink">{report.confidence}</p>
            <p className="mt-3 leading-7 text-ink-muted">{report.confidenceReason}</p>
          </div>
          <div className="border-l-2 border-accent pl-5">
            <p className="text-sm font-semibold uppercase text-accent">Keep the result in scope</p>
            <p className="mt-3 leading-7 text-ink-muted">
              This report covers one assessment session. It does not prove change
              over time or compare you with other test takers.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-5xl px-5 py-8 sm:px-8">
        <Button
          type="button"
          variant="outline"
          onClick={onRestart}
          className="rounded-[4px] border-ink/30 bg-transparent text-ink hover:bg-paper-deep"
        >
          Start over
        </Button>
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
  const [scoringStatus, setScoringStatus] = useState<"loading" | "error">("loading");
  const [scoringMessage, setScoringMessage] = useState("");
  const [report, setReport] = useState<AssessmentReport | null>(null);
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
    setScoringMessage("");
    completionRecordedRef.current = false;
    setView("assessment");
    void recordEvent("test_started");
  }, []);

  useEffect(() => {
    startRef.current = startAssessment;
  }, [startAssessment]);

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
    setScoringStatus("loading");
    setScoringMessage("");

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
        setScoringStatus("error");
        setScoringMessage(
          payload?.message ?? "The report could not be calculated right now. Please retry.",
        );
        return;
      }

      setReport(payload.report);
      setView("preview");
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch {
      setScoringStatus("error");
      setScoringMessage("The report could not be calculated right now. Your answers are still here; please retry.");
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
    return (
      <ScoringScreen
        status={scoringStatus}
        message={scoringMessage}
        onRetry={() => void calculateReport()}
        onBack={() => {
          setCurrentIndex(questions.length - 1);
          setView("assessment");
        }}
      />
    );
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
    return <FullReport report={report} onRestart={startAssessment} />;
  }

  return <Landing onStart={startAssessment} />;
}
