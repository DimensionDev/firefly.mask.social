'use client';

import { t, Trans } from '@lingui/macro';
import { createIndicator } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import { useCallback, useMemo } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { NotificationItem } from '@/components/Notification/NotificationItem.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { VirtualList } from '@/components/VirtualList.js';
import { ScrollListKey } from '@/constants/enum.js';

export default function Notification() {
    const currentSource = useGlobalState.use.currentSource();
    const isLogin = useIsLogin(currentSource);

    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = useSuspenseInfiniteQuery({
        queryKey: ['notifications', currentSource, isLogin],
        queryFn: async ({ pageParam }) => {
            if (!isLogin) return;
            return resolveSocialMediaProvider(currentSource)?.getNotifications(createIndicator(undefined, pageParam));
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage?.nextIndicator?.id,
        select: (data) => compact(data.pages.flatMap((x) => x?.data)),
    });

    const onEndReached = useCallback(async () => {
        if (!hasNextPage || isFetching || isFetchingNextPage) {
            return;
        }

        await fetchNextPage();
    }, [hasNextPage, isFetching, isFetchingNextPage]);

    useNavigatorTitle(t`Notifications`);

    if (!isLogin) {
        return <NotLoginFallback source={currentSource} />;
    }

    if (data.length === 0) {
        return (
            <div>
                <NoResultsFallback />
            </div>
        );
    }

    return (
        <div>
            <VirtualList
                listKey={ScrollListKey.Notification}
                computeItemKey={(index, notification) => `${notification.notificationId}-${index}`}
                data={data}
                endReached={onEndReached}
                itemContent={(index, notification) => {
                    return (
                        <NotificationItem notification={notification} key={`${notification.notificationId}-${index}`} />
                    );
                }}
                useWindowScroll
                components={{
                    Footer: () => {
                        if (!hasNextPage)
                            return (
                                <div className="flex items-center justify-center p-6 text-base text-secondary">
                                    <Trans>You&apos;ve hit rock bottom.</Trans>
                                </div>
                            );
                        return (
                            <div className="flex items-center justify-center p-2">
                                <LoadingIcon width={16} height={16} className="animate-spin" />
                            </div>
                        );
                    },
                }}
            />
        </div>
    );
}
