import type { Metadata } from 'next';
import type React from 'react';

import { KeyType } from '@/constants/enum.js';
import { type SourceInURL } from '@/constants/enum.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { getPostOGById } from '@/services/getPostOGById.js';

const getPostOGByIdRedis = memoizeWithRedis(getPostOGById, {
    key: KeyType.GetPostOGById,
});

interface Props {
    params: {
        id: string;
    };
    searchParams: {
        source?: SourceInURL;
    };
    children: React.ReactNode;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    if (isBotRequest() && searchParams.source) return getPostOGByIdRedis(searchParams.source, params.id);
    return createSiteMetadata();
}

export default function DetailLayout({ children }: Props) {
    if (isBotRequest()) return null;
    return <>{children}</>;
}
