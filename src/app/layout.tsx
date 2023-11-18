import './globals.css';

import { GA } from '@/components/GA.js';
import { classNames } from '@/helpers/classNames.js';
import { SideBar } from '@/components/SideBar/index.js';
import { SocialPlatformTabs } from '@/components/SocialPlatformTabs.js';
import { SearchBar } from '@/components/SearchBar.js';
import { Providers } from '@/app/provider.js';
import { Polyfills } from '@/components/Polyfills.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';

export const metadata = createSiteMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
            <Polyfills />
            </head>
            <body className={classNames('bg-white')}>
                <Providers>
                    <div
                        className={classNames({
                            // global
                            'relative m-auto h-screen bg-white': true,
                            // sm
                            [`sm:w-full`]: true,

                            // lg
                            [`lg:w-[1265px]`]: true,
                        })}
                    >
                        <SideBar />
                        <main
                            className={classNames({
                                // lg
                                ['lg:pl-72 lg:pr-96']: true,
                            })}
                        >
                            <div className="px-4 py-5">
                                <SocialPlatformTabs />
                            </div>
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