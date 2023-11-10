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
