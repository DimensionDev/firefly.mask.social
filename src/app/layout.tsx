import './globals.css';

import { ScrollRestorer } from 'next-scroll-restorer';

import { Providers } from '@/app/provider.js';
import { GA } from '@/components/GA.js';
import { Polyfills } from '@/components/Polyfills.js';
import { SearchBar } from '@/components/SearchBar.js';
import { SideBar } from '@/components/SideBar/index.js';
import { SocialPlatformTabs } from '@/components/SocialPlatformTabs.js';
import { classNames } from '@/helpers/classNames.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { Modals } from '@/modals/index.js';

export const metadata = createSiteMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <head>
                <Polyfills />
            </head>
            <body>
                <Providers>
                    <div
                        className={classNames({
                            // global
                            'm-auto h-screen': true,
                            // sm
                            [`sm:w-full`]: true,

                            // lg
                            [`lg:w-[1265px]`]: true,
                        })}
                    >
                        <SideBar />
                        <main className="pl-72 lg:pr-96">
                            <SocialPlatformTabs />

                            {children}
                        </main>
                        <SearchBar />
                    </div>
                    <Modals />
                </Providers>
                <GA />
            </body>
            <ScrollRestorer />
        </html>
    );
}
