'use client';

import { t } from '@lingui/macro';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import { type Dispatch, type SetStateAction, useCallback, useState, use } from 'react';

import { ListInPage } from '@/components/ListInPage.js';
import { NotificationFilter } from '@/components/Notification/NotificationFilter.js';
import { NotificationItem } from '@/components/Notification/NotificationItem.js';
import { ScrollListKey, type SocialDiscoverSource, type SocialSource, Source, SourceInURL } from '@/constants/enum.js';
import { createIndicator } from '@/helpers/pageable.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSource } from '@/helpers/resolveSource.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { useNotificationSettings } from '@/hooks/useNotificationSettings.js';
import { type Notification as NotificationObject, NotificationType } from '@/providers/types/SocialMedia.js';

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

export default function Notification(props: { params: Promise<{ source: SourceInURL }> }) {
    const params = use(props.params);
    const source = resolveSource(params.source) as SocialDiscoverSource;
    const profile = useCurrentProfile(source);
    const isLogin = useIsLogin(source);

    const [types, setTypes] = useNotificationTypes(source);

    const { enabled } = useNotificationSettings(source);

    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['notifications', source, isLogin, profile?.profileId, enabled],
        queryFn: async ({ pageParam }) => {
            if (!isLogin) return;
            const provider = resolveSocialMediaProvider(source);
            return provider.getNotifications(createIndicator(undefined, pageParam), enabled);
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
                <NotificationFilter className="mb-2 px-4 pt-3" source={source} types={types} onTypesChange={setTypes} />
            ) : null}
            <ListInPage
                source={source}
                key={source}
                queryResult={queryResult}
                loginRequired
                VirtualListProps={{
                    listKey: `${ScrollListKey.Notification}:${source}:${types.join('-')}`,
                    computeItemKey: (index, notification) => `${notification.notificationId}-${index}`,
                    itemContent: getNotificationItemContent,
                }}
                NoResultsFallbackProps={{
                    className: 'md:pt-[228px] max-md:py-20',
                }}
            />
        </>
    );
}
