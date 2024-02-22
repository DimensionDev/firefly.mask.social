import type { Viewport } from 'next';

export function createSiteViewport(viewport?: Partial<Viewport>) {
    return {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
        userScalable: false,
        ...viewport,
    } satisfies Viewport;
}
