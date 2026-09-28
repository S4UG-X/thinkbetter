PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_funnel_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_name` text NOT NULL,
	`occurred_at` text NOT NULL,
	CONSTRAINT "funnel_event_name_allowed" CHECK("__new_funnel_events"."event_name" in ('test_started', 'test_completed', 'email_signup'))
);
--> statement-breakpoint
INSERT INTO `__new_funnel_events`("id", "event_name", "occurred_at")
SELECT
	"id",
	CASE WHEN "event_name" = 'waitlist_signup' THEN 'email_signup' ELSE "event_name" END,
	"occurred_at"
FROM `funnel_events`;--> statement-breakpoint
DROP TABLE `funnel_events`;--> statement-breakpoint
ALTER TABLE `__new_funnel_events` RENAME TO `funnel_events`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_waitlist_signups` (
	`email` text PRIMARY KEY NOT NULL,
	`consent` integer DEFAULT false NOT NULL,
	`report_requested` integer DEFAULT false NOT NULL,
	`signed_up_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_waitlist_signups`("email", "consent", "signed_up_at")
SELECT "email", "consent", "signed_up_at" FROM `waitlist_signups`;--> statement-breakpoint
DROP TABLE `waitlist_signups`;--> statement-breakpoint
ALTER TABLE `__new_waitlist_signups` RENAME TO `waitlist_signups`;
