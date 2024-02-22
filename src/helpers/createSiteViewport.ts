import type { Viewport } from 'next';

export function createSiteViewport() {
    return {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
        userScalable: false,
    } satisfies Viewport;
}
