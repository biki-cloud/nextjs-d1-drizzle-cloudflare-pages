'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

type Customer = { customerId: string };

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState('');
  const router = useRouter();

  useEffect(() => {
    // 認証状態を確認
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/auth');
        return;
      }
      setUser(session.user);
      // 顧客データを取得
      fetchCustomers();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/auth');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId.trim()) return;

    try {
      const formData = new FormData();
      formData.append('customerId', customerId);
      const response = await fetch('/api/customers', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setCustomerId('');
        await fetchCustomers();
      }
    } catch (error) {
      console.error('Failed to create customer:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ホーム</h1>
          <p className="text-sm text-gray-600">ログイン中: {user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          ログアウト
        </button>
      </div>

      <div>
        <p>Your customer IDs</p>
        <ul>
          {customers.map((customer) => (
            <li key={customer.customerId}>{customer.customerId}</li>
          ))}
          <li>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="add a new customer ID"
              />
              <button type="submit" className="border-2 border-red-500 p-1">
                submit
              </button>
            </form>
          </li>
        </ul>
        <p>end</p>
      </div>
    </div>
  );
}
