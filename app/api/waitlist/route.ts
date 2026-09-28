import { z } from "zod";

import { DatabaseUnavailableError, getDatabase } from "@/db";

const waitlistPayload = z
  .object({
    email: z.string().trim().email().max(254),
    betaConsent: z.boolean(),
    ageConfirmed: z.literal(true),
  })
  .strict();

const noStoreHeaders = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  try {
    const payload = waitlistPayload.safeParse(await request.json());

    if (!payload.success) {
      const fields = payload.error.flatten().fieldErrors;
      const message = fields.email
        ? "Enter a valid email address."
        : fields.ageConfirmed
            ? "Email collection is currently limited to people aged 18 or older."
            : "Check the form and try again.";

      return Response.json(
        { message },
        { status: 422, headers: noStoreHeaders },
      );
    }

    const database = getDatabase();
    const email = payload.data.email.toLowerCase();
    const timestamp = new Date().toISOString();
    const saved = await database
      .prepare(
        `INSERT INTO waitlist_signups (email, consent, report_requested, signed_up_at)
         VALUES (?, ?, 1, ?)
         ON CONFLICT(email) DO UPDATE SET
           consent = CASE
             WHEN waitlist_signups.consent = 1 OR excluded.consent = 1 THEN 1
             ELSE 0
           END,
           report_requested = 1
         RETURNING email`,
      )
      .bind(email, payload.data.betaConsent ? 1 : 0, timestamp)
      .first<{ email: string }>();

    if (saved) {
      try {
        await database
          .prepare(
            `INSERT INTO funnel_events (event_name, occurred_at)
             VALUES ('email_signup', ?)`,
          )
          .bind(timestamp)
          .run();
      } catch (error) {
        console.error("Waitlist saved but signup event was unavailable", error);
      }
    }

    return Response.json(
      { message: "Email saved. No report email has been sent." },
      { status: 201, headers: noStoreHeaders },
    );
  } catch (error) {
    if (!(error instanceof DatabaseUnavailableError)) {
      console.error("Unable to save report-access email", error);
    }

    return Response.json(
      { message: "Signup isn't active right now. Your address was not saved." },
      { status: 503, headers: noStoreHeaders },
    );
  }
}
