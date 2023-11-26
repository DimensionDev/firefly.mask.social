import './globals.css';

import { ScrollRestorer } from 'next-scroll-restorer';

import { Providers } from '@/app/provider.js';
import { GA } from '@/components/GA.js';
import { Polyfills } from '@/components/Polyfills.js';
import { SearchBar } from '@/components/SearchBar.js';
import { SearchFilter } from '@/components/SearchFilter.js';
import { SideBar } from '@/components/SideBar/index.js';
import { SocialPlatformTabs } from '@/components/SocialPlatformTabs.js';
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
                    <div className="m-auto flex min-h-screen sm:w-full lg:w-[1265px] ">
                        <SideBar />
                        <main className="max-w-[888px] flex-1 border-r border-line pl-72">
                            <SearchBar />

                            <SocialPlatformTabs />

                            {children}
                        </main>

                        <SearchFilter />
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
