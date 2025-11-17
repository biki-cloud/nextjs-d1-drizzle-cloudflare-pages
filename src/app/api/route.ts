import { getDb } from '@/server/db';
import { customerTable } from '@/server/db/schema';
import type { CloudflareEnv } from '@/types/cloudflare';
import type { NextRequest } from 'next/server';

// OpenNext adapter handles edge runtime automatically
// export const runtime = 'edge';

type RouteContext = {
  env?: CloudflareEnv;
};

export async function GET(request: NextRequest) {
  try {
    // OpenNext adapterでは、AsyncLocalStorageから環境変数にアクセス
    const db = getDb();
    const result = await db.select().from(customerTable);
    return Response.json({ result });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return Response.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
