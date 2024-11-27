import { safeUnreachable } from '@masknet/kit';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { type SocialSource, Source } from '@/constants/enum.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { NotificationPlatform, NotificationPushType, NotificationTitle } from '@/providers/types/Firefly.js';

export function useNotificationSettings(source: SocialSource) {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['notification-push-switch'],
        async queryFn() {
            return FireflySocialMediaProvider.getNotificationPushSwitch();
        },
    });

    const enabled = useMemo(() => {
        const item = data?.list.find((x) => x.title === NotificationTitle.NotificationsMode);

        switch (source) {
            case Source.Farcaster:
                return (
                    item?.list.find(
                        (x) =>
                            x.platform === NotificationPlatform.Priority &&
                            x.push_type === NotificationPushType.Priority,
                    )?.state ?? false
                );
            case Source.Lens:
                return (
                    item?.list.find(
                        (x) =>
                            x.platform === NotificationPlatform.Priority && x.push_type === NotificationPushType.Lens,
                    )?.state ?? false
                );
            case Source.Twitter:
                return false;
            default:
                safeUnreachable(source);
                return false;
        }
    }, [data?.list, source]);

    return {
        enabled,
        isLoading,
        refetch,
    };
}
