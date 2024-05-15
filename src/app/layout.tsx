import '@/app/globals.css';

import { SpeedInsights } from '@vercel/speed-insights/next';
import { Inter } from 'next/font/google';
import { lazy } from 'react';

import { GoogleTagManager, GoogleAnalytics } from '@next/third-parties/google';
import { BeforeUnload } from '@/components/Compose/BeforeUnload.js';
import { Polyfills } from '@/components/Polyfills.js';
import { Providers } from '@/components/Providers.js';
import { SideBar } from '@/components/SideBar/index.js';
import { NODE_ENV, STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { Script } from '@/esm/Script.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { createSiteViewport } from '@/helpers/createSiteViewport.js';
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

export const viewport = createSiteViewport();

export default function RootLayout({ children }: { children: React.ReactNode }) {
    setLocale(getLocaleFromCookies());

    return (
        <html>
            <head>
                <Polyfills />
                <Script src="/js/browser-detector.js" defer />
                <meta name="theme-color" content="#ffffff" />
                <GoogleTagManager gtmId="GTM-WZZF2ZCF" />
                <GoogleAnalytics gaId="G-5VSBSKJ6JM" />
            </head>
            <body className={`${inter.variable} font-inter`}>
                <Providers>
                    <div className="m-auto flex w-full md:min-h-screen lg:w-[1265px]">
                        <CustomElements />
                        {children}
                        <SideBar />
                        <mask-page-inspector />
                    </div>
                    <Modals />
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
