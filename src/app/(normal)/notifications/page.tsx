'use client';

import { createIndicator } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import { useMemo } from 'react';
import { useInView } from 'react-cool-inview';

import LoadingIcon from '@/assets/loading.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { NotificationItem } from '@/components/Notification/NotificationItem.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { SocialPlatform } from '@/constants/enum.js';
import { useLogin } from '@/hooks/useLogin.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export default function Notification() {
    const currentSocialPlatform = useGlobalState.use.currentSocialPlatform();
    const isLogin = useLogin(currentSocialPlatform);

    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = useSuspenseInfiniteQuery({
        queryKey: ['notifications', currentSocialPlatform, isLogin],
        queryFn: async ({ pageParam }) => {
            if (!isLogin) return;
            switch (currentSocialPlatform) {
                case SocialPlatform.Lens:
                    return LensSocialMediaProvider.getNotifications(createIndicator(undefined, pageParam));
                case SocialPlatform.Farcaster:
                    return FireflySocialMediaProvider.getNotifications(createIndicator(undefined, pageParam));
                default:
                    return;
            }
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage?.nextIndicator?.id,
    });

    const { observe } = useInView({
        rootMargin: '300px 0px',
        onChange: async ({ inView }) => {
            if (!inView || !hasNextPage || isFetching || isFetchingNextPage) {
                return;
            }
            await fetchNextPage();
        },
    });

    const results = useMemo(() => compact(data.pages.flatMap((x) => x?.data)), [data.pages]);

    if (!isLogin) {
        return <NotLoginFallback platform={currentSocialPlatform} />;
    }

    return (
        <div>
            {results.length ? (
                results.map((notification, index) => <NotificationItem key={index} notification={notification} />)
            ) : (
                <NoResultsFallback />
            )}
            {hasNextPage && results.length ? (
                <div className="flex items-center justify-center p-2" ref={observe}>
                    <LoadingIcon width={16} height={16} className="animate-spin" />
                </div>
            ) : null}
        </div>
    );
}
