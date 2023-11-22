'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { memo } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { createIndicator, createPageable } from '@/maskbook/packages/shared-base/src/index.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { useGlobalState } from '@/store/index.js';

import { SinglePost } from './SinglePost.js';

export const Posts = memo(function Posts() {
    const currentSocialPlatform = useGlobalState.use.currentSocialPlatform();

    const { data } = useSuspenseInfiniteQuery({
        queryKey: ['discover', currentSocialPlatform],

        queryFn: async ({ pageParam }) => {
            switch (currentSocialPlatform) {
                case SocialPlatform.Lens:
                    return LensSocialMediaProvider.discoverPosts(createIndicator(undefined, pageParam));
                case SocialPlatform.Farcaster:
                    return FireflySocialMediaProvider.discoverPosts(createIndicator(undefined, pageParam));
                default:
                    return createPageable([], undefined);
            }
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
    });

    return data.pages.flatMap((x) => x.data).map((x) => <SinglePost post={x} key={x.postId} showMore />);
});
