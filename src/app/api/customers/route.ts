import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getDb } from '@/server/db';
import { customerTable } from '@/server/db/schema';
import type { CloudflareEnv } from '@/types/cloudflare';

// OpenNext adapter handles edge runtime automatically
// export const runtime = 'edge';

type RouteContext = {
  env?: CloudflareEnv;
};

export async function GET(request: NextRequest) {
  try {
    // OpenNext adapterでは、AsyncLocalStorageから環境変数にアクセス
    const db = getDb();
    const customers = await db.select().from(customerTable);
    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const customerId = formData.get('customerId') as string;
    
    if (!customerId) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 });
    }

    // OpenNext adapterでは、AsyncLocalStorageから環境変数にアクセス
    const db = getDb();
    await db.insert(customerTable).values({
      customerId: Number(customerId),
      companyName: 'Alfreds Futterkiste',
      contactName: 'Maria Anders',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error inserting customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}

