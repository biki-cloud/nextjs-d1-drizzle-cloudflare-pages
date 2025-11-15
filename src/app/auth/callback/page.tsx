'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    void handleCallback();

    // 認証状態の変更を監視（セッションが確立されたらリダイレクト）
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push('/home');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleCallback = async () => {
    try {
      // URLクエリパラメータを取得
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // エラーパラメータがある場合
      if (errorParam) {
        setError(`認証エラー: ${errorDescription || errorParam}`);
        setProcessing(false);
        setTimeout(() => {
          router.push('/auth');
        }, 3000);
        return;
      }

      if (code) {
        // PKCEフロー: codeをセッションに交換
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          setError(`認証エラー: ${exchangeError.message}`);
          setProcessing(false);
          setTimeout(() => {
            router.push('/auth');
          }, 3000);
          return;
        }

        // セッションが正常に設定されたので、ホームにリダイレクト
        router.push('/home');
      } else {
        // codeがない場合、既存のセッションを確認
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // セッションが既に存在する場合はホームにリダイレクト
          router.push('/home');
        } else {
          // セッションもcodeもない場合はエラー
          setError('セッションが見つかりませんでした。');
          setProcessing(false);
          setTimeout(() => {
            router.push('/auth');
          }, 3000);
        }
      }
    } catch (err) {
      console.error('Callback error:', err);
      setError('エラーが発生しました。');
      setProcessing(false);
      setTimeout(() => {
        router.push('/auth');
      }, 3000);
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="text-red-600">{error}</div>
        <div>ログインページにリダイレクトします...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div>認証中...</div>
      <div>ログインを処理しています。少々お待ちください。</div>
    </div>
  );
}

