import { cleanup } from '@testing-library/react';
import { fetch, Headers, Request, Response } from 'cross-fetch';
import { afterEach } from 'vitest';

// Add `fetch` polyfill.
globalThis.fetch = fetch;
globalThis.Headers = Headers;
globalThis.Request = Request;
globalThis.Response = Response;

// Add `navigator` polyfill.
Reflect.set(globalThis, 'navigator', {
    userAgent: 'vitest',
    language: 'en',
} as Navigator);

// Add `screen` polyfill.
Reflect.set(globalThis, 'screen', {
    width: 0,
    height: 0,
} as Screen);

// Add `location` polyfill.
Reflect.set(globalThis, 'location', {
    href: '',
    pathname: 'nodejs',
    protocol: 'https',
} as Location);

// Add `URL.canParse` polyfill.
Reflect.set(URL, 'canParse', (url: string) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
});

afterEach(() => {
    cleanup();
});
