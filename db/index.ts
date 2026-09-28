import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export class DatabaseUnavailableError extends Error {
  constructor() {
    super("The email database is unavailable.");
    this.name = "DatabaseUnavailableError";
  }
}

export function getDatabase() {
  if (!env.DB) {
    throw new DatabaseUnavailableError();
  }

  return env.DB;
}

export function getDb() {
  return drizzle(getDatabase(), { schema });
}
