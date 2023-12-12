'use client';

import { t } from '@lingui/macro';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useDocumentTitle } from 'usehooks-ts';

import { CommentList } from '@/components/Comments/index.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { SocialPlatform } from '@/constants/enum.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { WarpcastSocialMediaProvider } from '@/providers/warpcast/SocialMedia.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

export default function Page({ params }: { params: { id: string; platform: SocialPlatform } }) {
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();
    const { data } = useSuspenseQuery({
        queryKey: [params.platform, 'post-detail', params.id],
        queryFn: async () => {
            if (!params.id) return;
            switch (params.platform) {
                case SocialPlatform.Lens.toLowerCase(): {
                    const post = await LensSocialMediaProvider.getPostById(params.id);

                    // TODO: comment views
                    fetchAndStoreViews([post.postId]);

                    return post;
                }
                case SocialPlatform.Farcaster.toLowerCase(): {
                    const post = await FireflySocialMediaProvider.getPostById(params.id);
                    if (!post.author.handle) {
                        const author = await WarpcastSocialMediaProvider.getProfileById(post.author.profileId);
                        return {
                            ...post,
                            author,
                        };
                    }

                    return post;
                }
                default:
                    return;
            }
        },
    });

    useDocumentTitle(data ? createPageTitle(t`Post by ${data?.author.displayName}`) : '');

    if (!data) return;
    return (
        <div>
            <SinglePost post={data} disableAnimate />
            {/* TODO: Compose Comment Input */}
            <CommentList postId={params.id} platform={params.platform} />
        </div>
    );
}
