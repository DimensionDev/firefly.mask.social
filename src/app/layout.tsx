/* cspell:disable */

import '@dialectlabs/blinks/index.css';
import '@/app/globals.css';

import { setI18n } from "@lingui/react/server";

import { GoogleAnalytics } from '@next/third-parties/google';
import { Inter } from 'next/font/google';

import { LayoutBody } from '@/app/layout-body.js';
import { IfHostname } from '@/components/IfHostname.js';
import { IfPathname } from '@/components/IfPathname.js';
import { CZ_ACTIVITY_HOSTNAME } from '@/constants/index.js';
import { Script } from '@/esm/Script.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { getLocaleFromCookies } from '@/helpers/getLocaleFromCookies.js';
import { setLocale, setupLocale } from '@/i18n/index.js';

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
    const locale = getLocaleFromCookies()

    setI18n(setupLocale(locale));
    setLocale(locale);

    return (
        <html>
            <head>
                <Script src="/js/polyfills/base.js" strategy="beforeInteractive" />
                <Script src="/js/polyfills/dom.js" strategy="beforeInteractive" />
                <Script src="/js/polyfills/ecmascript.js" strategy="beforeInteractive" />
                <Script src="/js/polyfills/worker.js" strategy="beforeInteractive" />
                <IfHostname isNotOneOf={[CZ_ACTIVITY_HOSTNAME]}>
                    <IfPathname isNotOneOf={['/activity/cz']}>
                        <Script src="/js/browser-detector.js" defer />
                    </IfPathname>
                </IfHostname>
                <Script src="/js/safary.js" defer />
                <GoogleAnalytics gaId="G-61NFDTK6LT" />
                <meta name="theme-color" content="#ffffff" />
            </head>
            <body className={`${inter.variable} font-inter`}>
                <LayoutBody>{children}</LayoutBody>
            </body>
        </html>
    );
}
