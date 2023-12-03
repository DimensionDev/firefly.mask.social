import './globals.css';

import dynamic from 'next/dynamic.js';
import { ScrollRestorer } from 'next-scroll-restorer';

import { Providers } from '@/app/provider.js';
import { CalendarWidget } from '@/components/CalendarWidget.js';
import { GA } from '@/components/GA.js';
import { Polyfills } from '@/components/Polyfills.js';
import { SearchBar } from '@/components/SearchBar.js';
import { SearchFilter } from '@/components/SearchFilter.js';
import { SideBar } from '@/components/SideBar/index.js';
import { SocialPlatformTabs } from '@/components/SocialPlatformTabs.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { Modals } from '@/modals/index.js';

export const metadata = createSiteMetadata();

// @ts-ignore
const PageInspectorRender = dynamic(() => import('@/main/page-render.js'), { ssr: false });

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
                            <div className="sticky px-4">
                                <SearchBar source="header" />

                                <SocialPlatformTabs />
                            </div>

                            {children}
                        </main>

                        <aside className=" hidden w-96 overflow-y-auto px-4 lg:block">
                            <SearchFilter />

                            <SearchBar source="secondary" />

                            <CalendarWidget className="mt-4" />
                        </aside>
                    </div>
                    <Modals />
                    <PageInspectorRender />
                </Providers>
                <GA />
            </body>
            <ScrollRestorer />
        </html>
    );
}
