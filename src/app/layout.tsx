import './globals.css';

import { ScrollRestorer } from 'next-scroll-restorer';

import { Providers } from '@/app/provider.js';
import { CustomElements } from '@/components/CustomElements.js';
import { GA } from '@/components/GA.js';
import { Polyfills } from '@/components/Polyfills.js';
import { SideBar } from '@/components/SideBar/index.js';
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
                    {process.env.NEXT_PUBLIC_MASK_WEB_COMPONENTS === 'enabled' ? <CustomElements /> : null}

                    <div className="m-auto flex min-h-screen sm:w-full lg:w-[1265px] ">
                        <SideBar />
                        {children}
                    </div>
                    <Modals />
                </Providers>
                <GA />
            </body>
            <ScrollRestorer />
        </html>
    );
}
