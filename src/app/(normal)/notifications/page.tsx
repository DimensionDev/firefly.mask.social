'use client';

import { t } from '@lingui/macro';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import { type Dispatch, type SetStateAction, useCallback, useState } from 'react';

import { ListInPage } from '@/components/ListInPage.js';
import { NotificationFilter } from '@/components/Notification/NotificationFilter.js';
import { NotificationItem } from '@/components/Notification/NotificationItem.js';
import { ScrollListKey, type SocialSource, Source } from '@/constants/enum.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { createIndicator } from '@/helpers/pageable.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { type Notification as NotificationObject, NotificationType } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

function useNotificationTypes(source: SocialSource) {
    const [typesMap, setTypesMap] = useState<Record<SocialSource, NotificationType[]>>({
        [Source.Farcaster]: [],
        [Source.Lens]: [],
        [Source.Twitter]: [],
    });

    const types = typesMap[source];
    const setTypes: Dispatch<SetStateAction<NotificationType[]>> = useCallback(
        (types) => {
            setTypesMap((map) => {
                return {
                    ...map,
                    [source]: typeof types === 'function' ? types(map[source]) : types,
                };
            });
        },
        [source],
    );
    return [types, setTypes] as const;
}

const getNotificationItemContent = (index: number, notification: NotificationObject) => {
    return <NotificationItem key={notification.notificationId} notification={notification} />;
};

export default function Notification() {
    const currentSource = useGlobalState.use.currentSource();
    const currentSocialSource = narrowToSocialSource(currentSource);
    const profile = useCurrentProfile(currentSocialSource);
    const isLogin = useIsLogin(currentSocialSource);

    const [types, setTypes] = useNotificationTypes(currentSocialSource);

    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['notifications', currentSource, isLogin, profile?.profileId],
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
            {isLogin ? (
                <NotificationFilter
                    className="mb-2 px-4 pt-3"
                    source={currentSource}
                    types={types}
                    onTypesChange={setTypes}
                />
            ) : null}
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
