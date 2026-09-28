import { z } from "zod";

import { DatabaseUnavailableError, getDatabase } from "@/db";

const eventPayload = z
  .object({
    event: z.enum(["test_started", "test_completed"]),
  })
  .strict();

const noStoreHeaders = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  try {
    const payload = eventPayload.safeParse(await request.json());
    if (!payload.success) {
      return Response.json(
        { message: "Unsupported analytics event." },
        { status: 400, headers: noStoreHeaders },
      );
    }

    await getDatabase()
      .prepare(
        `INSERT INTO funnel_events (event_name, occurred_at)
         VALUES (?, ?)`,
      )
      .bind(payload.data.event, new Date().toISOString())
      .run();

    return new Response(null, { status: 204, headers: noStoreHeaders });
  } catch (error) {
    if (!(error instanceof DatabaseUnavailableError)) {
      console.error("Unable to save funnel event", error);
    }

    return Response.json(
      { message: "Analytics is unavailable." },
      { status: 503, headers: noStoreHeaders },
    );
  }
}
