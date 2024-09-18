import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation.js';

import { KeyType, type SocialSource, SourceInURL } from '@/constants/enum.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isProfilePageSource } from '@/helpers/isProfilePageSource.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { resolveSourceFromUrl, resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';
import { getProfileOGById } from '@/services/getProfileOGById.js';

interface Props {
    params: { source: string };
    searchParams: { source: SourceInURL };
}

const getProfileOGByIdRedis = memoizeWithRedis(getProfileOGById, {
    key: KeyType.GetProfileOGById,
});

export async function generateMetadata({ params: { source: id }, searchParams }: Props): Promise<Metadata> {
    const source = resolveSourceFromUrl(searchParams.source);
    if (source && isProfilePageSource(source)) return getProfileOGByIdRedis(source, id);
    return createSiteMetadata();
}

export default function Page({ params, searchParams }: Props) {
    const source = resolveSourceFromUrlNoFallback(searchParams.source ?? '') as SocialSource;
    if (source && isProfilePageSource(source)) {
        return redirect(resolveProfileUrl(source, params.source));
    }
    return notFound();
}
