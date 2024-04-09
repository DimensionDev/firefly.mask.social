import type { Metadata } from 'next';
import type React from 'react';

import { KeyType, SourceInURL } from '@/constants/enum.js';
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
    searchParams: { [key: string]: string | string[] | undefined };
    children: React.ReactNode;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    if (isBotRequest() && searchParams.source) return getPostOGByIdRedis(searchParams.source as SourceInURL, params.id);
    return createSiteMetadata();
}

export default function DetailLayout({ children }: { children: React.ReactNode }) {
    if (isBotRequest()) return null;
    return <>{children}</>;
}
