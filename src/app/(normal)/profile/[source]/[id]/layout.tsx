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
    console.log('DEBUG: profile generateMetadata', isBotRequest());

    if (isBotRequest()) {
        return createSiteMetadata();
    }

    return createSiteMetadata();
}

export default function DetailLayout({ children }: { children: React.ReactNode }) {
    if (isBotRequest()) return null;

    return <>{children}</>;
}
