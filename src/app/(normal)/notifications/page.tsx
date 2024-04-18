'use client';

import { t } from '@lingui/macro';
import { createIndicator } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import { useCallback } from 'react';

import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { NotificationItem } from '@/components/Notification/NotificationItem.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { VirtualList } from '@/components/VirtualList/VirtualList.js';
import { VirtualListFooter } from '@/components/VirtualList/VirtualListFooter.js';
import { ScrollListKey } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { type Notification as NotificationType } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

const getNotificationItemContent = (index: number, notification: NotificationType) => {
    return <NotificationItem notification={notification} key={`${notification.notificationId}-${index}`} />;
};

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
    }, [hasNextPage, isFetching, isFetchingNextPage, fetchNextPage]);

    useNavigatorTitle(t`Notifications`);

    if (!isLogin) {
        return <NotLoginFallback source={currentSource} />;
    }

    if (!data.length) {
        return <NoResultsFallback className="pt-[228px]" />;
    }

    return (
        <VirtualList
            listKey={ScrollListKey.Notification}
            computeItemKey={(index, notification) => `${notification.notificationId}-${index}`}
            data={data}
            endReached={onEndReached}
            itemContent={getNotificationItemContent}
            useWindowScroll
            context={{ hasNextPage }}
            components={{
                Footer: VirtualListFooter,
            }}
        />
    );
}
