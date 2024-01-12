import { compact } from 'lodash-es';
import type { Metadata } from 'next';
import type React from 'react';
import { cache } from 'react';
import urlcat from 'urlcat';

import { SITE_URL } from '@/constants/index.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';
import { resolveSource, type SourceInURL } from '@/helpers/resolveSource.js';
import { getPostById } from '@/services/getPostById.js';

interface Props {
    params: {
        id: string;
        source: SourceInURL;
    };
    children: React.ReactNode;
}

const createPageOG = cache(async (source: SourceInURL, postId: string) => {
    const post = await getPostById(resolveSource(source), postId);
    if (!post) return createSiteMetadata();

    const images = compact(
        post.metadata.content?.attachments?.map((x) => {
            const url = x.type === 'Image' ? x.uri : x.coverUri;
            return url ? { url } : undefined;
        }),
    );
    const audios = compact(
        post.metadata.content?.attachments?.map((x) => {
            const url = x.type === 'Audio' ? x.uri : undefined;
            return url ? { url } : undefined;
        }),
    );
    const videos = compact(
        post.metadata.content?.attachments?.map((x) => {
            const url = x.type === 'Video' ? x.uri : undefined;
            return url ? { url } : undefined;
        }),
    );

    return createSiteMetadata({
        openGraph: {
            type: 'article',
            url: urlcat(SITE_URL, getPostUrl(post)),
            title: createPageTitle(`Post by ${post.author.displayName}`),
            description: post.metadata.content?.content ?? '',
            images,
            audio: audios,
            videos,
        },
        twitter: {
            card: 'summary_large_image',
            title: createPageTitle(`Post by ${post.author.displayName}`),
            description: post.metadata.content?.content ?? '',
            images,
        },
    });
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    if (isBotRequest()) return createPageOG(params.source, params.id);
    return createSiteMetadata();
}

export default function DetailLayout({ children }: Props) {
    if (isBotRequest()) return null;
    return <>{children}</>;
}
