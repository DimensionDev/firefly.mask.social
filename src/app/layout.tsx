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
                        <main>
                            {children}
                        </main>
                        <aside className=" sticky top-0 z-[998] h-full w-96 px-4 lg:block">
                            <SearchBar source="secondary" />

                            <SearchFilter />

                            <CalendarWidget />
                        </aside>
                    </div>
                    <Modals />
                    <PageInspectorRender />
                </Providers>
                <GA />
            </body >
            <ScrollRestorer />
        </html >
    );
}
