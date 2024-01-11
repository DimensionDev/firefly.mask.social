import { compact } from 'lodash-es';
import type { Metadata } from 'next';
import type React from 'react';

import { createPageTitle } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    console.log('DEBUG: generateMetadata', isBotRequest());

    if (isBotRequest()) {
        const post = await getPostById(resolveSource(params.source), params.id);

        console.log('DEBUG: post', !!post);

        if (!post) return createSiteMetadata();

        return createSiteMetadata({
            openGraph: {
                title: createPageTitle(`Post by ${post.author.displayName}`),
                description: post.metadata.content?.content ?? '',
                images: compact(
                    post.metadata.content?.attachments?.map((x) => {
                        const url = x.type === 'Image' ? x.uri : x.coverUri;
                        return url ? { url } : undefined;
                    }),
                ),
                audio: compact(
                    post.metadata.content?.attachments?.map((x) => {
                        const url = x.type === 'Audio' ? x.uri : undefined;
                        return url ? { url } : undefined;
                    }),
                ),
                videos: compact(
                    post.metadata.content?.attachments?.map((x) => {
                        const url = x.type === 'Video' ? x.uri : undefined;
                        return url ? { url } : undefined;
                    }),
                ),
            },
        });
    }

    return createSiteMetadata();
}

export default function DetailLayout({ children }: Props) {
    if (isBotRequest()) return null;
    return <>{children}</>;
}
