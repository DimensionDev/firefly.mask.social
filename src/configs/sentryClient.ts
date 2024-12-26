import { feedbackIntegration } from '@sentry/browser';
import * as Sentry from '@sentry/nextjs';

import { env } from '@/constants/env.js';
import { settings } from '@/settings/index.js';

export const feedback = feedbackIntegration({
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

        Sentry.init({
            dsn: env.external.NEXT_PUBLIC_SENTRY_DSN,

            release: process.version,
            environment: env.shared.NODE_ENV,
            integrations: [feedback],

            tracesSampleRate: 1.0,
            tracePropagationTargets: [],

            replaysSessionSampleRate: 1.0,
            replaysOnErrorSampleRate: 1.0,
        });

        const tags: Record<string, string> = {
            version: env.shared.VERSION,
            commitHash: env.shared.COMMIT_HASH ?? 'unknown',
            rootURL: settings.FIREFLY_ROOT_URL,
        };

        // set initial tags
        Object.entries(tags).forEach(([key, value]) => {
            Sentry.setTag(key, value);
        });
        this.initialized = true;
        console.log(`[sentry] Initialized with DSN: ${env.external.NEXT_PUBLIC_SENTRY_DSN}`);
    }
}

export const sentryClient = new SentryClient();
