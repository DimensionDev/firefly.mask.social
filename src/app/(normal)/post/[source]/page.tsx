import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation.js';

import { KeyType, type SocialSourceInURL } from '@/constants/enum.js';
import { createMetadataPostById } from '@/helpers/createMetadataPostById.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isSocialSourceInUrl } from '@/helpers/isSocialSource.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { resolvePostUrl } from '@/helpers/resolvePostUrl.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';

export const revalidate = 60;

const createPageMetadata = memoizeWithRedis(createMetadataPostById, {
    key: KeyType.CreateMetadataPostById,
});

interface Props {
    params: Promise<{
        source: SocialSourceInURL;
    }>;
    searchParams: Promise<{ source: SocialSourceInURL }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const searchParams = await props.searchParams;
    const params = await props.params;
    if (isSocialSourceInUrl(searchParams.source)) return createPageMetadata(searchParams.source, params.source);
    return createSiteMetadata();
}

export default async function Page(props: Props) {
    const searchParams = await props.searchParams;
    const params = await props.params;
    if (!searchParams.source) notFound();
    if (!isSocialSourceInUrl(params.source)) {
        redirect(resolvePostUrl(resolveSocialSource(searchParams.source), params.source));
    }
    notFound();
}
