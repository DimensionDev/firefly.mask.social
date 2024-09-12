import type { Metadata } from 'next';
import { notFound } from 'next/navigation.js';
import type React from 'react';

import { PostDetailPage } from '@/app/(normal)/post/[source]/[id]/pages/DetailPage.js';
import { LoginRequiredGuard } from '@/components/LoginRequiredGuard.js';
import { KeyType, type SocialSourceInURL } from '@/constants/enum.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';
import { isSocialSourceInURL } from '@/helpers/isSocialSource.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { getPostOGById } from '@/services/getPostOGById.js';

export const revalidate = 60;

const getPostOGByIdRedis = memoizeWithRedis(getPostOGById, {
    key: KeyType.GetPostOGById,
});

interface Props {
    params: {
        id: string;
        source: SocialSourceInURL;
    };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    if (isSocialSourceInURL(params.source)) {
        return getPostOGByIdRedis(params.source, params.id);
    }
    return createSiteMetadata();
}

export default async function Page(props: Props) {
    if (isBotRequest()) return null;
    const { params } = props;
    if (!isSocialSourceInURL(params.source)) return notFound();
    const source = resolveSocialSource(params.source);
    const provider = resolveSocialMediaProvider(source);
    const post = await provider.getPostById(params.id).catch(() => null);

    if (!post) return notFound();

    return (
        <LoginRequiredGuard source={source}>
            <PostDetailPage post={post} id={params.id} source={source} />
        </LoginRequiredGuard>
    );
}
