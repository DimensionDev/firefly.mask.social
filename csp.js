const cspConfig = {
    'default-src': ['https:', 'wss:', "'self'"],
    'script-src': [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://www.googletagmanager.com/',
        'https://cdn.jsdelivr.net',
        'https://*.vercel-scripts.com',
        'https://*.firefly.land/',
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'worker-src': ["'self'", 'blob:'],
};

// Add Sentry DSN to CSP report-uri
if (process.env.NEXT_PUBLIC_SENTRY_REPORT_URL) {
    cspConfig['report-uri'] = [process.env.NEXT_PUBLIC_SENTRY_REPORT_URL];
}

if (process.env.NODE_ENV === 'development') {
    Object.entries(cspConfig).forEach(([key, value]) => {
        if (key === 'report-uri') return;
        value.push('http://localhost:3000', 'ws://localhost:3000');
    });
}

export const POLICY_SETTINGS = Object.entries(cspConfig)
    .map(([key, value]) => `${key} ${value.join(' ')}`)
    .join('; ');

