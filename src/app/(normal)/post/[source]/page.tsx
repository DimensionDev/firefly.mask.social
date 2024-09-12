import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation.js';

import { KeyType, type SocialSourceInURL } from '@/constants/enum.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isSocialSourceInURL } from '@/helpers/isSocialSource.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { resolvePostUrl } from '@/helpers/resolvePostUrl.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { getPostOGById } from '@/services/getPostOGById.js';

export const revalidate = 60;

const getPostOGByIdRedis = memoizeWithRedis(getPostOGById, {
    key: KeyType.GetPostOGById,
});

interface Props {
    params: {
        source: SocialSourceInURL;
    };
    searchParams: { source: SocialSourceInURL };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    if (isSocialSourceInURL(searchParams.source)) {
        return getPostOGByIdRedis(searchParams.source, params.source);
    }
    return createSiteMetadata();
}

export default async function Page({ params, searchParams }: Props) {
    if (!searchParams.source) return notFound();
    if (!isSocialSourceInURL(params.source)) {
        return redirect(resolvePostUrl(resolveSocialSource(searchParams.source), params.source));
    }
    return notFound();
}
