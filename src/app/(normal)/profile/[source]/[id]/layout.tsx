import type { Metadata } from 'next';
import type React from 'react';
import urlcat from 'urlcat';

import { SITE_URL } from '@/constants/index.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';
import { resolveSource, type SourceInURL } from '@/helpers/resolveSource.js';
import { getProfileById } from '@/services/getProfileById.js';

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
        const profile = await getProfileById(resolveSource(params.source), params.id);
        if (!profile) return createSiteMetadata();

        const images = [
            {
                url: profile.pfp,
            },
        ];

        const title = createPageTitle(`${profile.displayName} (@${profile.handle})`);
        const description = profile.bio ?? '';

        return createSiteMetadata({
            openGraph: {
                type: 'profile',
                url: urlcat(SITE_URL, getProfileUrl(profile)),
                title,
                description,
                images,
            },
            twitter: {
                card: 'summary',
                title,
                description,
                images,
            },
        });
    }

    return createSiteMetadata();
}

export default function DetailLayout({ children }: { children: React.ReactNode }) {
    if (isBotRequest()) return null;

    return <>{children}</>;
}
