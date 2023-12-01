'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useDocumentTitle } from 'usehooks-ts';

import { SinglePost } from '@/components/Posts/SinglePost.js';
import { SocialPlatform } from '@/constants/enum.js';
import { SITE_NAME } from '@/constants/index.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

export default function Page({ params }: { params: { id: string; platform: string } }) {
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();
    const { data } = useSuspenseQuery({
        queryKey: [params.platform, 'post-detail', params.id],
        queryFn: async () => {
            if (!params.id) return;
            switch (params.platform) {
                case SocialPlatform.Lens.toLowerCase():
                    const result = await LensSocialMediaProvider.getPostById(params.id);

                    // TODO: comment views
                    fetchAndStoreViews([result.postId]);

                    return result;
                case SocialPlatform.Farcaster.toLowerCase():
                    return FireflySocialMediaProvider.getPostById(params.id);
                default:
                    return;
            }
        },
    });

    useDocumentTitle(data ? `Post by ${data?.author.displayName} • ${SITE_NAME}` : '');

    if (!data) return;
    return <SinglePost post={data} disableAnimate />;
}
