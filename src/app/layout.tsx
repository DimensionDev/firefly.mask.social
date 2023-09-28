import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { GA } from '@/components/GA';
import { WagmiProvider } from '@/components/WagmiProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Mask Social',
    description: 'The Mask Social Website.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <WagmiProvider>{children}</WagmiProvider>
                <GA />
            </body>
        </html>
    );
}
