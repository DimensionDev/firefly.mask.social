/* cspell:disable */

import '@dialectlabs/blinks/index.css';
import '@/app/globals.css';

import { GoogleAnalytics } from '@next/third-parties/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Inter } from 'next/font/google';
import { lazy } from 'react';

import { BeforeUnload } from '@/components/Compose/BeforeUnload.js';
import { IfPathname } from '@/components/IfPathname.js';
import { Polyfills } from '@/components/Polyfills.js';
import { Providers } from '@/components/Providers.js';
import { RouteProgressBar } from '@/components/RouteProgressBar.js';
import { SideBar } from '@/components/SideBar/index.js';
import { NODE_ENV, STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { Script } from '@/esm/Script.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { getLocaleFromCookies } from '@/helpers/getLocaleFromCookies.js';
import { setLocale } from '@/i18n/index.js';
import { Modals } from '@/modals/index.js';

// @ts-ignore
const CustomElements = lazy(() => {
    if (
        env.shared.NODE_ENV !== NODE_ENV.Development ||
        (env.shared.NODE_ENV === NODE_ENV.Development &&
            env.external.NEXT_PUBLIC_MASK_WEB_COMPONENTS === STATUS.Enabled)
    )
        return import('@/components/CustomElements.js');

    // disable mask web components
    return Promise.resolve({
        default: () => null,
    });
});

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
    setLocale(getLocaleFromCookies());

    return (
        <html>
            <head>
                <Polyfills />
                <Script src="/js/browser-detector.js" defer />
                <Script src="/js/safary.js" defer />
                <meta name="theme-color" content="#ffffff" />
                <GoogleAnalytics gaId="G-61NFDTK6LT" />
            </head>
            <body className={`${inter.variable} font-inter`}>
                <Providers>
                    <div className="m-auto flex w-full md:min-h-screen group-[.not-support]:md:min-h-[calc(100vh_-_38px)] lg:w-[1265px]">
                        <CustomElements />
                        {children}
                        <IfPathname isNotOneOf={['/login/desktop']}>
                            <SideBar />
                        </IfPathname>
                        <mask-page-inspector />
                    </div>
                    <Modals />
                    <RouteProgressBar
                        height="2px"
                        color="var(--color-firefly-brand)"
                        options={{ showSpinner: false }}
                        shallowRouting
                    />
                </Providers>
                <SpeedInsights />
                <BeforeUnload />
                <Script
                    src="https://cdn.jsdelivr.net/npm/bowser@2.11.0/es5.min.js"
                    async
                    strategy="beforeInteractive"
                />
            </body>
        </html>
    );
}
