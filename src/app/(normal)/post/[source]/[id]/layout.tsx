import type { Metadata } from 'next';
import type React from 'react';

import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';
import type { SourceInURL } from '@/helpers/resolveSource.js';

interface Props {
    params: {
        id: string;
        source: SourceInURL;
    };
    children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    console.log('DEBUG: generateMetadata - isBotRequest', isBotRequest());

    if (isBotRequest())
        return createSiteMetadata({
            openGraph: {
                title: 'For bots only',
                description: 'Hi! Bots. This page is for you only. Please, go away.',
            },
        });
    return createSiteMetadata();
}

export default function DetailLayout({ children }: Props) {
    if (isBotRequest()) return null;
    return <>{children}</>;
}
