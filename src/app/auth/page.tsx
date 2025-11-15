'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export default function AuthPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // 現在のセッションを確認
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session) {
        router.push('/home');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage(`エラー: ${error.message}`);
        setLoading(false);
      }
      // 成功時は自動的にGoogleの認証ページにリダイレクトされるため、
      // ここでは何もしない
    } catch (error) {
      setMessage('エラーが発生しました。');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p>ログイン中: {user.email}</p>
        <button
          onClick={handleLogout}
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">ログイン</h1>
      {message && (
        <div className="rounded bg-red-100 px-4 py-2 text-red-700">{message}</div>
      )}
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="rounded bg-blue-500 px-6 py-3 text-white hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? '認証中...' : 'Googleでログイン'}
      </button>
    </div>
  );
}

