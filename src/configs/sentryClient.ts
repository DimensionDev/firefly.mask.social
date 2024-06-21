import * as Sentry from '@sentry/browser';

import { env } from '@/constants/env.js';

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

        const tags: Record<string, string> = {
            version: env.shared.VERSION,
            commitHash: env.shared.COMMIT_HASH ?? 'unknown',
            siteURL: env.external.NEXT_PUBLIC_SITE_URL ?? 'unknown',
            fireflyURL: env.external.NEXT_PUBLIC_FIREFLY_API_URL,
        };

        Sentry.onLoad(() => {
            Sentry.init({
                dsn: env.external.NEXT_PUBLIC_SENTRY_DSN,

                release: process.version,
                environment: env.shared.NODE_ENV,
                integrations: [feedbackIntegration],

                tracesSampleRate: 1.0,
                tracePropagationTargets: [],

                replaysSessionSampleRate: 1.0,
                replaysOnErrorSampleRate: 1.0,
            });

            // set initial tags
            Object.entries(tags).forEach(([key, value]) => {
                Sentry.setTag(key, value);
            });

            this.initialized = true;
            console.log(`[sentry] Initialized with DSN: ${env.external.NEXT_PUBLIC_SENTRY_DSN}`);
        });
    }
}

export const sentryClient = new SentryClient();
