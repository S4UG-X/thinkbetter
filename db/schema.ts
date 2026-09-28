import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const waitlistSignups = sqliteTable(
  "waitlist_signups",
  {
    email: text("email").primaryKey(),
    consent: integer("consent", { mode: "boolean" }).notNull().default(false),
    reportRequested: integer("report_requested", { mode: "boolean" })
      .notNull()
      .default(false),
    signedUpAt: text("signed_up_at").notNull(),
  },
);

export const funnelEvents = sqliteTable(
  "funnel_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    eventName: text("event_name", {
      enum: ["test_started", "test_completed", "email_signup"],
    }).notNull(),
    occurredAt: text("occurred_at").notNull(),
  },
  (table) => [
    check(
      "funnel_event_name_allowed",
      sql`${table.eventName} in ('test_started', 'test_completed', 'email_signup')`,
    ),
  ],
);
