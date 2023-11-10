import '../globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { GA } from '@/components/GA';
import { classNames } from '@/helpers/classNames';
import { SideBar } from '@/components/SideBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Mask Social',
    description: 'The Mask Social Website.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
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
                            ['lg:pl-72 lg:pr-96']: true,
                        })}
                    >
                        {children}
                    </main>
                    <aside className="absolute inset-y-0 right-0 hidden w-96 overflow-y-auto border-l border-gray-200 px-4 py-6 sm:px-6 lg:px-8 lg:block">
                        <input
                            type="search"
                            name="search"
                            id="search"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="Search Lens handle or Farcaster"
                        />
                    </aside>
                </div>

                <GA />
            </body>
        </html>
    );
}
