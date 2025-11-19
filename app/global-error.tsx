'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            maxWidth: '28rem',
            textAlign: 'center',
          }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
            }}>
              앗! 문제가 발생했습니다
            </h1>
            <p style={{
              color: '#666',
              marginBottom: '2rem',
            }}>
              예상치 못한 오류가 발생했습니다. 불편을 드려 죄송합니다.
            </p>
            {error.digest && (
              <p style={{
                fontSize: '0.875rem',
                color: '#999',
                marginBottom: '1rem',
              }}>
                오류 ID: {error.digest}
              </p>
            )}
            <Button
              onClick={reset}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
              }}
            >
              다시 시도
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
