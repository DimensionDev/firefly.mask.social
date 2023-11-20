'use client';

import { createIndicator, createPageable } from '@/maskbook/packages/shared-base/src/index.js';
import { SinglePost } from './SinglePost.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { useGlobalState } from '@/store/index.js';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { memo } from 'react';
import { SocialPlatform } from '@/constants/enum.js';
import { FireflySocialMediaprovider } from '@/providers/firefly/SocialMedia.js';

export const Posts = memo(function Posts() {
    const currentSocialPlatform = useGlobalState.use.currentSocialPlatform();

    const { data } = useSuspenseInfiniteQuery({
        queryKey: ['discover', currentSocialPlatform],

        queryFn: async ({ pageParam }) => {
            switch (currentSocialPlatform) {
                case SocialPlatform.Lens:
                    return LensSocialMediaProvider.discoverPosts(createIndicator(undefined, pageParam));
                case SocialPlatform.Farcaster:
                    return FireflySocialMediaprovider.discoverPosts(createIndicator(undefined, pageParam));
                default:
                    return createPageable([], undefined);
            }
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
    });

    return data.pages.flatMap((x) => x.data).map((x) => <SinglePost post={x} key={x.postId} />);
});
