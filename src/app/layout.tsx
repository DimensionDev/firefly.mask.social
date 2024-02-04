import '@/app/globals.css';

import { Inter } from 'next/font/google';
import { cookies } from 'next/headers.js';
import { ScrollRestorer } from 'next-scroll-restorer';
import { lazy } from 'react';

import { GA } from '@/components/GA.js';
import { MobileFallback } from '@/components/MobileFallback.js';
import { Polyfills } from '@/components/Polyfills.js';
import { Providers } from '@/components/Providers.js';
import { SideBar } from '@/components/SideBar/index.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { resolveLocale } from '@/helpers/resolveLocale.js';
import { setLocale } from '@/i18n/index.js';
import { Modals } from '@/modals/index.js';

// @ts-ignore
const CustomElements = lazy(() => import('@/components/CustomElements.js'));

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
});

setLocale(resolveLocale(cookies().get('locale')?.value));

export const metadata = createSiteMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <Polyfills />
            </head>
            <body className={`${inter.variable} font-inter`}>
                <Providers>
                    <div className="m-auto hidden min-h-screen md:flex md:w-full lg:w-[1265px]">
                        {process.env.NODE_ENV !== 'development' ||
                        (process.env.NODE_ENV === 'development' &&
                            process.env.NEXT_PUBLIC_MASK_WEB_COMPONENTS === 'enabled') ? (
                            <CustomElements />
                        ) : null}
                        <SideBar />
                        {children}
                        <mask-page-inspector />
                    </div>
                    <MobileFallback />
                    <Modals />
                </Providers>
                <GA />
            </body>
            <ScrollRestorer />
        </html>
    );
}
