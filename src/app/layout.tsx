/* cspell:disable */

import '@/app/globals.css';
import '@dialectlabs/blinks/index.css';

import { GoogleAnalytics } from '@next/third-parties/google';
import { isServer } from '@tanstack/react-query';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers.js';

import { LayoutBody } from '@/app/layout-body.js';
import { ErrorBoundary } from '@/components/ErrorBoundary/index.js';
import { Script } from '@/esm/Script.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
});

export const metadata = createSiteMetadata();

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const rootClass = isServer ? cookies().get('firefly_root_class')?.value : undefined;

    return (
        <html className={rootClass}>
            <head>
                <Script src="/js/polyfills/base.js" strategy="beforeInteractive" />
                <Script src="/js/polyfills/dom.js" strategy="beforeInteractive" />
                <Script src="/js/polyfills/ecmascript.js" strategy="beforeInteractive" />
                <Script src="/js/polyfills/worker.js" strategy="beforeInteractive" />
                <Script src="/js/browser-detector.js" defer />
                <Script src="/js/safary.js" defer />
                <GoogleAnalytics gaId="G-61NFDTK6LT" />
                <link rel="preload" as="font" href="/font/level-up.otf" />
                <meta name="theme-color" content="#ffffff" />
            </head>
            <body className={`${inter.variable} font-inter`}>
                <ErrorBoundary>
                    <LayoutBody>{children}</LayoutBody>
                </ErrorBoundary>
            </body>
        </html>
    );
}
