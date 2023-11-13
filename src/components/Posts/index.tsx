'use client';
import { SinglePost } from '@/components/Posts/SinglePost';
import { createIndicator } from '@/helpers/createPageable';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia';
import { useGlobalState } from '@/store';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { memo } from 'react';

export const Posts = memo(function Posts() {
    const currentSocialPlatform = useGlobalState.use.currentSocialPlatform();

    const { data, isLoading, error } = useSuspenseInfiniteQuery({
        queryKey: ['discover', currentSocialPlatform],

        queryFn: async ({ pageParam }) => {
            return LensSocialMediaProvider.discoverPosts(createIndicator(undefined, pageParam));
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator,
    });

    return data.pages
        .map((x) => x.data)
        .flat()
        .map((x) => <SinglePost post={x} key={x.postId} />);
});
