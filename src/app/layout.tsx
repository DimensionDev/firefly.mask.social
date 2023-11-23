import './globals.css';

import { Providers } from '@/app/provider.js';
import { GA } from '@/components/GA.js';
import { Polyfills } from '@/components/Polyfills.js';
import { SearchBar } from '@/components/SearchBar.js';
import { SideBar } from '@/components/SideBar/index.js';
import { SocialPlatformTabs } from '@/components/SocialPlatformTabs.js';
import { classNames } from '@/helpers/classNames.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';

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
                            'relative m-auto h-screen': true,
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
                </Providers>
                <GA />
            </body>
        </html>
    );
}
