'use client';

import { breadcrumbsIntegration, globalHandlersIntegration, init } from '@sentry/react';

try {
    const IGNORE_ERRORS = ['ResizeObserver loop limit exceeded'];

    init({
        release: process.version,
        dsn: process.env.SENTRY_DNS,
        defaultIntegrations: false,
        integrations: [
            // global error and unhandledrejection event
            globalHandlersIntegration(),
            // global fetch error
            breadcrumbsIntegration({
                console: false,
                dom: false,
                xhr: false,
                fetch: true,
                history: false,
            }),
        ],
        environment: process.env.NODE_ENV,
        beforeSend(event) {
            // ignored errors
            if (event.exception?.values?.some((x) => IGNORE_ERRORS.some((y) => x.value?.includes(y)))) return null;
            if (event.message && IGNORE_ERRORS.some((x) => event.message?.includes(x))) return null;

            return event;
        },
    });
    console.info('[sentry] Initialized');
} catch (error) {
    console.error('[sentry] Failed to initialize:', error);
}
