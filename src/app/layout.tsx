import './globals.css';

import { Inter } from 'next/font/google';
import { ScrollRestorer } from 'next-scroll-restorer';

import { BuildInfo } from '@/components/BuildInfo.js';
import { GA } from '@/components/GA.js';
import { MobileFallback } from '@/components/MobileFallback.js';
import { Polyfills } from '@/components/Polyfills.js';
import { Providers } from '@/components/Providers.js';
import { SideBar } from '@/components/SideBar/index.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { setLocale } from '@/i18n/index.js';
import { Modals } from '@/modals/index.js';
import { Locale } from '@/types/index.js';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
});

setLocale(Locale.en);

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
                        <SideBar />
                        {children}
                    </div>
                    <MobileFallback />
                    <Modals />
                </Providers>
                <GA />
                <BuildInfo />
            </body>
            <ScrollRestorer />
        </html>
    );
}
