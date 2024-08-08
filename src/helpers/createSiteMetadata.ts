import type { Metadata } from 'next';

import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/constants/index.js';

export function createSiteMetadata(metadata?: Partial<Metadata>) {
    return {
        metadataBase: new URL(SITE_URL),
        title: SITE_NAME,
        itunes: {
            appId: '1640183078',
        },
        description: SITE_DESCRIPTION,
        openGraph: {
            title: SITE_NAME,
            description: SITE_DESCRIPTION,
            url: SITE_URL,
            images: [`${SITE_URL}/image/og.png`],
        },
        twitter: {
            card: 'summary',
            title: SITE_NAME,
            description: SITE_DESCRIPTION,
            creator: '@thefireflyapp',
            images: [`${SITE_URL}/image/og.png`],
        },
        manifest: '/site.webmanifest',
        icons: [
            {
                url: '/android-chrome-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                url: '/android-chrome-384x384.png',
                sizes: '384x384',
                type: 'image/png',
            },
            {
                rel: 'icon',
                url: '/favicon.ico',
            },
            {
                rel: 'apple-touch-icon',
                url: '/apple-touch-icon-57x57.png',
            },
        ],
        ...metadata,
    } satisfies Metadata;
}
