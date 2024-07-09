'use client';

import { t } from '@lingui/macro';
import { createIndicator } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import { useState } from 'react';

import { ListInPage } from '@/components/ListInPage.js';
import { NotificationFilter } from '@/components/Notification/NotificationFilter.js';
import { NotificationItem } from '@/components/Notification/NotificationItem.js';
import { ScrollListKey } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { type Notification as NotificationObject, NotificationType } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

const getNotificationItemContent = (index: number, notification: NotificationObject) => {
    return <NotificationItem key={notification.notificationId} notification={notification} />;
};

export default function Notification() {
    const currentSource = useGlobalState.use.currentSource();
    const currentSocialSource = narrowToSocialSource(currentSource);
    const isLogin = useIsLogin(currentSocialSource);

    const [types, setTypes] = useState<NotificationType[]>(EMPTY_LIST);
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
        select: (data) => {
            const list = compact(data.pages.flatMap((x) => x?.data));
            if (types.length === 0) return list;
            return list.filter((x) => types.includes(x.type));
        },
    });

    useNavigatorTitle(t`Notifications`);

    return (
        <>
            <NotificationFilter
                className="mb-2 px-4 pt-3"
                source={currentSource}
                types={types}
                onTypesChange={setTypes}
            />
            <ListInPage
                key={currentSource}
                queryResult={queryResult}
                loginRequired
                VirtualListProps={{
                    listKey: `${ScrollListKey.Notification}:${currentSource}:${types.join('-')}`,
                    computeItemKey: (index, notification) => `${notification.notificationId}-${index}`,
                    itemContent: getNotificationItemContent,
                }}
                NoResultsFallbackProps={{
                    className: 'pt-[228px]',
                }}
            />
        </>
    );
}
