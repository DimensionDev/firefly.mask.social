'use client';

import { BrowserTracing, init, Replay } from '@sentry/react';

try {
    init({
        dsn: process.env.SENTRY_DNS,
        integrations: [new BrowserTracing(), new Replay()],
        // Performance Monitoring
        tracesSampleRate: 1.0, // Capture 100% of the transactions
        // Session Replay
        replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
        replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
    });
} catch (error) {
    console.error('[sentry] Failed to initialize:', error);
}
