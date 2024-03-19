'use client';

import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
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
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export default function Notification() {
    const currentSource = useGlobalState.use.currentSource();
    const isLogin = useIsLogin(currentSource);

    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = useSuspenseInfiniteQuery({
        queryKey: ['notifications', currentSource, isLogin],
        queryFn: async ({ pageParam }) => {
            if (!isLogin) return;
            switch (currentSource) {
                case SocialPlatform.Lens:
                    return LensSocialMediaProvider.getNotifications(createIndicator(undefined, pageParam));
                case SocialPlatform.Farcaster:
                    return FireflySocialMediaProvider.getNotifications(createIndicator(undefined, pageParam));
                case SocialPlatform.Twitter:
                    return;
                default:
                    safeUnreachable(currentSource);
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

    useNavigatorTitle(t`Notifications`);

    if (!isLogin) {
        return <NotLoginFallback source={currentSource} />;
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
            ) : (
                <div className="flex items-center justify-center p-6 text-base text-secondary">
                    <Trans>You&apos;ve hit rock bottom.</Trans>
                </div>
            )}
        </div>
    );
}
