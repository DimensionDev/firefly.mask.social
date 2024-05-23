'use client';

import { t } from '@lingui/macro';
import { createIndicator } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';

import { ListInPage } from '@/components/ListInPage.js';
import { NotificationItem } from '@/components/Notification/NotificationItem.js';
import { ScrollListKey } from '@/constants/enum.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { type Notification as NotificationType } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

const getNotificationItemContent = (index: number, notification: NotificationType) => {
    return <NotificationItem key={notification.notificationId} notification={notification} />;
};

export default function Notification() {
    const currentSource = useGlobalState.use.currentSource();
    const currentSocialSource = narrowToSocialSource(currentSource);
    const isLogin = useIsLogin(currentSocialSource);

    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['notifications', currentSource, isLogin],
        queryFn: async ({ pageParam }) => {
            if (!isLogin) return;
            const provider = resolveSocialMediaProvider(currentSocialSource);
            return provider.getNotifications(createIndicator(undefined, pageParam));
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => {
            if (lastPage?.data.length === 0) return;
            return lastPage?.nextIndicator?.id;
        },
        select: (data) => compact(data.pages.flatMap((x) => x?.data)),
    });

    useNavigatorTitle(t`Notifications`);

    return (
        <ListInPage
            key={currentSource}
            queryResult={queryResult}
            loginRequired
            VirtualListProps={{
                listKey: `${ScrollListKey.Notification}:${currentSource}`,
                computeItemKey: (index, notification) => `${notification.notificationId}-${index}`,
                itemContent: getNotificationItemContent,
            }}
            NoResultsFallbackProps={{
                className: 'pt-[228px]',
            }}
        />
    );
}
