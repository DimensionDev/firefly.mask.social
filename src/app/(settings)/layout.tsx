import '../globals.css';

import { Inter } from 'next/font/google';
import { GA } from '@/components/GA.js';
import { Polyfills } from '@/components/Polyfills.js';
import { classNames } from '@/helpers/classNames.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { SideBar } from '@/components/SideBar.js';

const inter = Inter({ subsets: ['latin'] });

export const metadata = createSiteMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <Polyfills />
            </head>
            <body className={classNames(inter.className, 'bg-white')}>
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
                            ['lg:pl-72']: true,
                        })}
                    >
                        {children}
                    </main>
                </div>

                <GA />
            </body>
        </html>
    );
}
