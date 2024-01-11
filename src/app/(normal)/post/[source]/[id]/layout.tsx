import { compact } from 'lodash-es';
import type { Metadata } from 'next';
import type React from 'react';

import { attachmentToOpenGraphImage } from '@/helpers/attachmentToOpenGraphImage.js';
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
    if (isBotRequest()) {
        console.log('DEBUG: generateMetadata', isBotRequest());

        const post = await getPostById(resolveSource(params.source), params.id);
        if (!post) return createSiteMetadata();

        const allSettled = await Promise.allSettled(
            post.metadata.content?.attachments?.map(attachmentToOpenGraphImage) ?? [],
        );

        return createSiteMetadata({
            openGraph: {
                title: createPageTitle(`Post by ${post.author.displayName}`),
                description: post.metadata.content?.content ?? '',
                images: compact(allSettled.map((x) => (x.status === 'fulfilled' && !!x.value ? x.value : undefined))),
            },
        });
    }

    return createSiteMetadata();
}

export default function DetailLayout({ children }: Props) {
    if (isBotRequest()) return null;
    return <>{children}</>;
}
