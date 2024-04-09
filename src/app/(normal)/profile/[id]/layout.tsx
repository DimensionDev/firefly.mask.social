import type { Metadata } from 'next';
import type React from 'react';

import { KeyType, type SourceInURL } from '@/constants/enum.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { getProfileOGById } from '@/services/getProfileOGById.js';

const getProfileOGByIdRedis = memoizeWithRedis(getProfileOGById, {
    key: KeyType.GetProfileOGById,
});

interface Props {
    params: {
        id: string;
        source: SourceInURL;
    };
    searchParams: {
        source?: SourceInURL;
    };
    children: React.ReactNode;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    if (isBotRequest() && searchParams.source) return getProfileOGByIdRedis(searchParams.source, params.id);
    return createSiteMetadata();
}

export default function DetailLayout({ children }: { children: React.ReactNode }) {
    if (isBotRequest()) return null;

    return <>{children}</>;
}
