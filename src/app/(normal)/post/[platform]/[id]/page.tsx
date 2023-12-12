'use client';

import { t } from '@lingui/macro';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useDocumentTitle } from 'usehooks-ts';

import { CommentList } from '@/components/Comments/index.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { SocialPlatform } from '@/constants/enum.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { resolvePlatform } from '@/helpers/resolvePlatform.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { WarpcastSocialMediaProvider } from '@/providers/warpcast/SocialMedia.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

interface PostPageProps {
    params: { id: string; platform: 'lens' | 'farcaster' };
}

export default function PostPage({ params: { id: postId, platform: _platform } }: PostPageProps) {
    const platform = resolvePlatform(_platform);

    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();
    const { data } = useSuspenseQuery({
        queryKey: [platform, 'post-detail', postId],
        queryFn: async () => {
            if (!postId) return;
            switch (platform) {
                case SocialPlatform.Lens: {
                    const post = await LensSocialMediaProvider.getPostById(postId);

                    // TODO: comment views
                    fetchAndStoreViews([post.postId]);

                    return post;
                }
                case SocialPlatform.Farcaster: {
                    const post = await FireflySocialMediaProvider.getPostById(postId);
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
            <CommentList postId={postId} platform={platform} />
        </div>
    );
}
