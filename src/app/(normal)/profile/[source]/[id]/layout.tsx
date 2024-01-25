import type { Metadata } from 'next';
import type React from 'react';

import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { type SourceInURL } from '@/helpers/resolveSource.js';
import { getProfileOGById } from '@/services/getProfileOGById.js';

const getProfileOGById_ = memoizeWithRedis('PROFILE_OG', getProfileOGById);

interface Props {
    params: {
        id: string;
        source: SourceInURL;
    };
    children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    if (isBotRequest()) return getProfileOGById_(params.source, params.id);
    return createSiteMetadata();
}

export default function DetailLayout({ children }: { children: React.ReactNode }) {
    if (isBotRequest()) return null;

    return <>{children}</>;
}
