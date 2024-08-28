import { compact } from 'lodash-es';
import urlcat from 'urlcat';

import type { SocialSourceInURL } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';

export async function getPostOGById(source: SocialSourceInURL, postId: string) {
    const provider = resolveSocialMediaProvider(resolveSocialSource(source));
    const post = await provider.getPostById(postId).catch(() => null);
    if (!post) return createSiteMetadata();

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

    const ogImage = urlcat(SITE_URL, '/api/og/:source/:postId/image', {
        source,
        postId,
    });

    return createSiteMetadata({
        openGraph: {
            type: 'article',
            url: urlcat(SITE_URL, getPostUrl(post)),
            title: `Posted by ${post.author.displayName} via Firefly`,
            description: post.metadata.content?.content ?? '',
            images: [ogImage],
            audio: audios,
            videos,
        },
        twitter: {
            card: 'summary_large_image',
            title: `Posted by ${post.author.displayName} via Firefly`,
            description: post.metadata.content?.content ?? '',
            images: [ogImage],
        },
    });
}
