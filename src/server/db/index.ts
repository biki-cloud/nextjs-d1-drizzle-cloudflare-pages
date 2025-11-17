import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@/server/db/schema';
import type { D1Database } from '@cloudflare/workers-types';

// OpenNext adapter handles edge runtime automatically
// export const runtime = 'edge';

/**
 * Get Cloudflare context from AsyncLocalStorage
 * OpenNext adapter stores context in globalThis[Symbol.for("__cloudflare-context__")]
 */
function getCloudflareContext(): { env?: { DB?: D1Database }; ctx?: unknown; cf?: unknown } | undefined {
  const contextSymbol = Symbol.for('__cloudflare-context__');
  // @ts-ignore - OpenNext adapter stores context in this symbol, which is not in TypeScript types
  return globalThis[contextSymbol] as { env?: { DB?: D1Database }; ctx?: unknown; cf?: unknown } | undefined;
}

/**
 * Get D1 database instance from Cloudflare environment
 * For OpenNext adapter, we get the DB from AsyncLocalStorage context
 */
export function getDb(env?: { DB?: D1Database }): ReturnType<typeof drizzle> {
  // First, try to use passed env parameter
  if (env?.DB) {
    return drizzle(env.DB, { schema });
  }

  // Then, try to get from OpenNext adapter's context
  const context = getCloudflareContext();
  if (context?.env?.DB) {
    return drizzle(context.env.DB, { schema });
  }

  // Fallback for development or when env is not available
  if (process.env.NODE_ENV === 'development') {
    throw new Error('DB environment variable is required. Make sure D1 database is configured in wrangler.toml.');
  }

  throw new Error('DB environment variable is required');
}

// For backward compatibility, export a function that can be called with env
// This will be used in Route Handlers
export const createDb = getDb;
