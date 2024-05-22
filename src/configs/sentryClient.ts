import * as Sentry from '@sentry/browser';

class SentryClient {
    private initialized = false;

    init() {
        // make sure we only initialize once
        if (this.initialized) return;

        Sentry.onLoad(() => {
            Sentry.init({
                dsn: `${process.env.NEXT_PUBLIC_SENTRY_DSN}`,

                release: `${process.version}`,
                integrations: [
                    Sentry.feedbackIntegration({
                        showBranding: false,
                    }),
                ],

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
