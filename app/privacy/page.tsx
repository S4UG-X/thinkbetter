import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Notice | Critical Thinking Check",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy notice"
      intro="This notice explains how the assessment, report, email access, and optional product updates handle information."
      sections={[
        {
          title: "Taking the assessment",
          content: (
            <>
              <p>
                You can take the assessment without creating an account or giving
                an email address. Your typed answers remain only in temporary
                browser memory while the assessment and report session is open.
              </p>
              <p>
                When you finish, the answer text is sent to the application server
                for scoring. If scoring is configured, the server sends the responses
                to the OpenAI API with storage disabled to apply the supplied rubric
                and return a structured report. The application does not write answers
                or reports to its database, email record, or analytics.
              </p>
              <p>
                Answers and the returned report remain in temporary browser memory so
                you can retry scoring or view the report. Refreshing, closing, leaving,
                or starting over discards that session. Service providers may still
                process routine technical data to operate and secure their services.
              </p>
            </>
          ),
        },
        {
          title: "Email access and optional product updates",
          content: (
            <>
              <p>
                Completing the assessment and viewing the report preview do not require
                an email. An email address is required to open the full report in the
                current browser session. Saving it stores the normalized email address,
                report-request status, product-update consent, and signup timestamp
                in a table separate from assessment answers.
              </p>
              <p>
                Product-update consent is separate, optional, and unchecked by
                default. The adult-age confirmation is checked before email collection
                but is not stored. The service does not email the report or send a
                confirmation message. No marketing email is authorized unless the
                separate product-update checkbox is selected.
              </p>
            </>
          ),
        },
        {
          title: "Basic funnel analytics",
          content: (
            <>
              <p>
                The application records only an event name and timestamp when an
                assessment is started, an assessment is completed, or a new
                email record is successfully saved.
              </p>
              <p>
                These records do not contain answer text, email addresses, user
                identifiers, or a purchase event. The application database does
                not store IP addresses or browser identifiers. Hosting providers
                may process routine technical request data to operate and secure
                the service.
              </p>
            </>
          ),
        },
        {
          title: "Retention and separation",
          content: (
            <>
              <p>
                No automatic deletion schedule is configured. Email entries
                and funnel-event records remain until the owner removes them.
                Assessment answers and reports are never written to either table.
              </p>
              <p>
                The assessment does not use browser local storage or session
                storage for answers, accounts, repeat-test history, or
                progress-over-time tracking.
              </p>
            </>
          ),
        },
        {
          title: "Payments, audio, and accounts",
          content: (
            <p>
              The service has no payment collection, card form, checkout, microphone
              permission, voice recording, audio upload, transcription, password
              login, or application account system. The hosting platform may require
              its own access authentication; the assessment does not store that identity.
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
      ]}
    />
  );
}
