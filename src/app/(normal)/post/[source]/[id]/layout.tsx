import type { Metadata } from 'next';
import type React from 'react';

import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { type SourceInURL } from '@/helpers/resolveSource.js';
import { getPostOGById } from '@/services/getPostOGById.js';

const getPostOGByIdRedis = memoizeWithRedis(getPostOGById, {
    key: 'post_og',
});

interface Props {
    params: {
        id: string;
        source: SourceInURL;
    };
    children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    if (isBotRequest()) return getPostOGByIdRedis(params.source, params.id);
    return createSiteMetadata();
}

export default function DetailLayout({ children }: Props) {
    if (isBotRequest()) return null;
    return <>{children}</>;
}
