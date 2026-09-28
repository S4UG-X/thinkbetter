import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Draft Terms | Critical Thinking Check",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      intro="These draft terms describe the limited educational purpose and current capabilities of the pre-launch MVP."
      sections={[
        {
          title: "Educational purpose only",
          content: (
            <p>
              The assessment is an educational self-reflection exercise. It is
              not clinical, diagnostic, validated, normed, or predictive, and it
              must not be used for admissions, employment, academic placement,
              or decisions about a person&apos;s intelligence or general ability.
            </p>
          ),
        },
        {
          title: "Current results",
          content: (
            <>
              <p>
                When scoring is configured and succeeds, the assessment reports
                multiple-choice accuracy and a separate written-reasoning result. The
                six written items use the supplied 0–4 rubric, for a maximum of 24 when
                all are rated. The two results are not combined, and unrated items are
                not counted as incorrect or as zero.
              </p>
              <p>
                Five headings organize qualitative feedback across specified questions.
                They are a reporting crosswalk, not validated numeric subscales, and
                have no weights, thresholds, rankings, or pass/fail labels. Automated
                evaluation can make mistakes and should be reviewed during the pilot.
              </p>
            </>
          ),
        },
        {
          title: "Free MVP and future pricing",
          content: (
            <p>
              The current MVP and its report are free. No payment is taken, no card
              data is collected, and there is no checkout. Pricing for possible future
              features will be announced later.
            </p>
          ),
        },
        {
          title: "Email and optional notifications",
          content: (
            <p>
              No email is needed to take the assessment or view the report preview.
              Saving an email is required to open the full report in the browser, but
              does not cause the report to be emailed. The separate beta-notification
              checkbox is optional and does not authorize other marketing.
            </p>
          ),
        },
        {
          title: "Age policy",
          content: (
            <p>
              The owner has not finalized eligibility or parental-consent rules
              for people under 18. Until that decision is made, email collection is
              limited to people who confirm they are at least 18. This draft does
              not state that under-18 users are eligible.
            </p>
          ),
        },
        {
          title: "Availability and changes",
          content: (
            <p>
              This is an early MVP and features may be unavailable, revised, or
              removed. Scoring requires a configured server-side evaluator and may be
              temporarily unavailable. Payment, outbound report email, accounts, voice
              features, browser interventions, and longitudinal tracking are not part
              of the implemented product.
            </p>
          ),
        },
        {
          title: "Owner details",
          content: (
            <p>
              The legal owner name, jurisdiction, governing terms, contact details,
              and dispute provisions must be supplied and reviewed before public
              launch. This draft intentionally does not invent them.
            </p>
          ),
        },
      ]}
    />
  );
}
