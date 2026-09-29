import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms | Critical Thinking Check",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      intro="These terms describe the educational purpose and current features of Critical Thinking Check."
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
                evaluation can make mistakes and should be interpreted with care.
              </p>
            </>
          ),
        },
        {
          title: "Access and payment",
          content: (
            <p>
              The assessment and its report are free. No payment is taken, no card
              data is collected, and there is no checkout.
            </p>
          ),
        },
        {
          title: "Email and optional notifications",
          content: (
            <p>
              No email is needed to take the assessment or view the report preview.
              Saving an email is required to open the full report in the browser, but
              does not cause the report to be emailed. The separate product-update
              checkbox is optional and does not authorize other marketing.
            </p>
          ),
        },
        {
          title: "Age policy",
          content: (
            <p>
              Email collection is limited to people who confirm they are at least 18.
              People under 18 should not submit an email address.
            </p>
          ),
        },
        {
          title: "Availability and changes",
          content: (
            <p>
              Features may be revised or temporarily unavailable. Scoring requires a
              configured server-side evaluator. The service does not provide payment,
              outbound report email, accounts, voice features, or progress tracking.
            </p>
          ),
        },
      ]}
    />
  );
}
