import { env } from '@/constants/env.js';
import * as Sentry from '@sentry/browser';

export const feedbackIntegration = Sentry.feedbackIntegration({
    id: 'sentry-feedback',
    colorScheme: 'system',
    isNameRequired: false,
    isEmailRequired: false,
    autoInject: false,
    showBranding: false,
});

class SentryClient {
    private initialized = false;

    init() {
        // make sure we only initialize once
        if (this.initialized) return;

        Sentry.onLoad(() => {
            Sentry.init({
                dsn: `${process.env.NEXT_PUBLIC_SENTRY_DSN}`,

                release: env.shared.VERSION,
                environment: env.shared.NODE_ENV,
                integrations: [feedbackIntegration],

                tracesSampleRate: 1.0,
                tracePropagationTargets: [],

                replaysSessionSampleRate: 1.0,
                replaysOnErrorSampleRate: 1.0,
            });
            this.initialized = true;
            console.log(`[sentry] Initialized with DSN: ${process.env.NEXT_PUBLIC_SENTRY_DSN}`);
        });
    }
}

export const sentryClient = new SentryClient();
