import React from 'react';

// Retry wrapper for dynamic imports used with React.lazy to tolerate transient
// dev-server/network failures (useful in dev and flaky CI environments).
export function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  attempts = 3,
  delay = 300
) {
  return React.lazy(() => {
    let tries = attempts;
    const attempt = (): Promise<{ default: T }> =>
      factory().catch((err) => {
        if (--tries > 0) {
          console.warn('lazy import failed, retrying...', { triesLeft: tries, err });
          return new Promise((resolve) => setTimeout(resolve, delay)).then(attempt);
        }
        throw err;
      });
    return attempt();
  });
}
