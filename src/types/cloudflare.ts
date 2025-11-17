import type { D1Database } from '@cloudflare/workers-types';

export interface CloudflareEnv {
  DB: D1Database;
}

