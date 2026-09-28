CREATE TABLE `funnel_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_name` text NOT NULL,
	`occurred_at` text NOT NULL,
	CONSTRAINT "funnel_event_name_allowed" CHECK("funnel_events"."event_name" in ('test_started', 'test_completed', 'waitlist_signup'))
);
--> statement-breakpoint
CREATE TABLE `waitlist_signups` (
	`email` text PRIMARY KEY NOT NULL,
	`consent` integer NOT NULL,
	`signed_up_at` text NOT NULL,
	CONSTRAINT "waitlist_consent_true" CHECK("waitlist_signups"."consent" = 1)
);
