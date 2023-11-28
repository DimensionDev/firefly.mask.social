'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';

import { NotificationItem } from '@/components/Notification/NotificationItem.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { SocialPlatform } from '@/constants/enum.js';
import { useLogin } from '@/hooks/useLogin.js';
import { createIndicator } from '@/maskbook/packages/shared-base/src/index.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export default function Notification() {
    const currentSocialPlatform = useGlobalState.use.currentSocialPlatform();
    const isLogin = useLogin();

    const { data } = useSuspenseInfiniteQuery({
        queryKey: ['notifications', currentSocialPlatform, isLogin],
        queryFn: async ({ pageParam }) => {
            if (!isLogin) return;
            switch (currentSocialPlatform) {
                case SocialPlatform.Lens:
                    return LensSocialMediaProvider.getNotifications(createIndicator(undefined, pageParam));
                case SocialPlatform.Farcaster:
                    return;
            }
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage?.nextIndicator?.id,
    });

    if (!isLogin) {
        return <NotLoginFallback platform={currentSocialPlatform} />;
    }

    return (
        <div>
            {compact(data.pages.flatMap((x) => x?.data)).map((notification, index) => (
                <NotificationItem key={index} notification={notification} />
            ))}
        </div>
    );
}
