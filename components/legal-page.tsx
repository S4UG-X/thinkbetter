import Link from "next/link";
import type { ReactNode } from "react";

type Section = {
  title: string;
  content: ReactNode;
};

export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: Section[];
}) {
  return (
    <main id="main-content" className="min-h-screen">
      <header className="border-b border-ink/15 bg-paper/95">
        <div className="mx-auto flex min-h-16 w-full max-w-5xl items-center justify-between gap-5 px-5 py-3 sm:px-8">
          <Link className="font-serif text-lg font-semibold text-ink" href="/">
            Critical Thinking Check
          </Link>
          <Link className="text-sm text-ink-muted underline decoration-ink/30 underline-offset-4 hover:text-accent" href="/">
            Back to assessment
          </Link>
        </div>
      </header>

      <article className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <h1 className="font-serif text-5xl font-semibold leading-tight text-ink sm:text-6xl">
          {title}
        </h1>
        <p className="mt-6 text-lg leading-8 text-ink-muted">{intro}</p>

        <div className="mt-12 divide-y divide-ink/15 border-y border-ink/15">
          {sections.map((section) => (
            <section key={section.title} className="py-8">
              <h2 className="font-serif text-2xl font-semibold text-ink">{section.title}</h2>
              <div className="legal-copy mt-4 space-y-4 leading-7 text-ink-muted">
                {section.content}
              </div>
            </section>
          ))}
        </div>
      </article>

      <footer className="border-t border-ink/15 bg-paper-deep/50">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap gap-x-6 gap-y-3 px-5 py-8 text-sm text-ink-muted sm:px-8">
          <Link className="underline decoration-ink/30 underline-offset-4 hover:text-accent" href="/privacy">
            Privacy
          </Link>
          <Link className="underline decoration-ink/30 underline-offset-4 hover:text-accent" href="/terms">
            Terms
          </Link>
          <Link className="underline decoration-ink/30 underline-offset-4 hover:text-accent" href="/">
            Assessment
          </Link>
        </div>
      </footer>
    </main>
  );
}
