'use client';

import { t } from '@lingui/macro';
import { createIndicator } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';

import { ListInPage } from '@/components/ListInPage.js';
import { NotificationItem } from '@/components/Notification/NotificationItem.js';
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

    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['notifications', currentSource, isLogin],
        queryFn: async ({ pageParam }) => {
            if (!isLogin) return;
            return resolveSocialMediaProvider(currentSource)?.getNotifications(createIndicator(undefined, pageParam));
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage?.nextIndicator?.id,
        select: (data) => compact(data.pages.flatMap((x) => x?.data)),
    });

    useNavigatorTitle(t`Notifications`);

    return (
        <ListInPage
            queryResult={queryResult}
            loginRequired
            VirtualListProps={{
                listKey: ScrollListKey.Notification,
                computeItemKey: (index, notification) => `${notification.notificationId}-${index}`,
                itemContent: getNotificationItemContent,
            }}
            NoResultsFallbackProps={{
                className: 'pt-[228px]',
            }}
        />
    );
}
