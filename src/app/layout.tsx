import './globals.css';

import type { Metadata } from 'next';
import { GA } from '@/components/GA';
import { classNames } from '@/helpers/classNames';
import { SideBar } from '@/components/SideBar';
import { SocialPlatformTabs } from '@/components/SocialPlatformTabs';
import { SearchBar } from '@/components/SearchBar';
import { Providers } from '@/app/providers';

export const metadata: Metadata = {
    title: 'Mask Social',
    description: 'The Mask Social Website.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
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
