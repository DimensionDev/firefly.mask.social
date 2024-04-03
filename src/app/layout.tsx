import '@/app/globals.css';

import { SpeedInsights } from '@vercel/speed-insights/next';
import { Inter } from 'next/font/google';
import { ScrollRestorer } from 'next-scroll-restorer';
import { lazy } from 'react';

import { BeforeUnload } from '@/components/Compose/BeforeUnload.js';
import { GA } from '@/components/GA.js';
import { Polyfills } from '@/components/Polyfills.js';
import { Providers } from '@/components/Providers.js';
import { SideBar } from '@/components/SideBar/index.js';
import { Script } from '@/esm/Script.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { createSiteViewport } from '@/helpers/createSiteViewport.js';
import { getLocaleFromCookies } from '@/helpers/getLocaleFromCookies.js';
import { setLocale } from '@/i18n/index.js';
import { Modals } from '@/modals/index.js';

// @ts-ignore
const CustomElements = lazy(() => import('@/components/CustomElements.js'));

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
                <Script src="https://cdn.jsdelivr.net/npm/bowser@2.11.0/es5.min.js" />
                <Script src="/js/browser-detector.js" defer />
            </head>
            <body className={`${inter.variable} font-inter`}>
                <Providers>
                    <div
                        className="l g:w-[1265px] m-auto flex min-h-screen
                    w-full"
                    >
                        {process.env.NODE_ENV !== 'development' ||
                        (process.env.NODE_ENV === 'development' &&
                            process.env.NEXT_PUBLIC_MASK_WEB_COMPONENTS === 'enabled') ? (
                            <CustomElements />
                        ) : null}
                        {children}
                        <SideBar />
                        <mask-page-inspector />
                    </div>
                    <Modals />
                </Providers>
                <GA />
                <SpeedInsights />
                <BeforeUnload />
            </body>
            <ScrollRestorer />
        </html>
    );
}
