import { getDb } from '@/server/db';
import { customerTable } from '@/server/db/schema';
import type { CloudflareEnv } from '@/types/cloudflare';

// OpenNext adapter handles edge runtime automatically
// export const runtime = 'edge';

/**
 * Get customers from database
 * Note: Server Actions in OpenNext adapter may need to receive env differently
 * For now, this function requires env to be passed, but Server Actions may need
 * a different approach depending on OpenNext adapter's implementation
 */
export const getCustomers = async (env?: CloudflareEnv) => {
  'use server';

  const db = getDb(env);
  return await db.select().from(customerTable);
};

export const createCustomerWithCustomId = async (formData: FormData, env?: CloudflareEnv) => {
  'use server';

  const customerId = formData.get('customerId');

  try {
    const db = getDb(env);
    await db.insert(customerTable).values({
      customerId: Number(customerId),
      companyName: 'Alfreds Futterkiste',
      contactName: 'Maria Anders',
    });

    console.log('Customer inserted successfully.');
  } catch (error) {
    console.error('Error inserting customer:', error);
  }
};
