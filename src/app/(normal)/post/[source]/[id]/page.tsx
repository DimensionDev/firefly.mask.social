'use client';

import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useDocumentTitle } from 'usehooks-ts';

import { CommentList } from '@/components/Comments/index.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { SocialPlatform } from '@/constants/enum.js';
import { dynamic } from '@/esm/dynamic.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { resolveSource, type SourceInURL } from '@/helpers/resolveSource.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/index.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

const PostActions = dynamic(() => import('@/components/Actions/index.js').then((module) => module.PostActions), {
    ssr: false,
});
interface PostPageProps {
    params: { id: string; source: SourceInURL };
}

export default function PostPage({ params: { id: postId, source: _source } }: PostPageProps) {
    const currentSource = resolveSource(_source);

    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();
    const { data } = useSuspenseQuery({
        queryKey: [currentSource, 'post-detail', postId],
        queryFn: async () => {
            if (!postId) return;
            switch (currentSource) {
                case SocialPlatform.Lens: {
                    const post = await LensSocialMediaProvider.getPostById(postId);

                    // TODO: comment views
                    fetchAndStoreViews([post.postId]);

                    return post;
                }
                case SocialPlatform.Farcaster: {
                    const post = await FarcasterSocialMediaProvider.getPostById(postId);
                    return post;
                }
                default:
                    safeUnreachable(currentSource);
                    return;
            }
        },
    });

    useDocumentTitle(data ? createPageTitle(t`Post by ${data?.author.displayName}`) : '');

    if (!data) return;
    return (
        <div>
            <SinglePost post={data} disableAnimate isDetail />
            <PostActions
                disablePadding
                post={data}
                disabled={data?.isHidden}
                className="!mt-0 border-b border-secondaryLine px-4 py-3"
            />
            {/* TODO: Compose Comment Input */}
            <CommentList postId={postId} source={currentSource} />
        </div>
    );
}
