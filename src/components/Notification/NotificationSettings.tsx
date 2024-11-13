'use client';

import { Popover, PopoverButton, PopoverPanel, Switch } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import SettingsIcon from '@/assets/setting.svg';
import { type SocialSource, Source } from '@/constants/enum.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { NotificationPlatform, NotificationPushType, NotificationTitle } from '@/providers/types/Firefly.js';

export function NotificationSettings({ source }: { source: SocialSource }) {
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

    const [{ loading }, onSwitch] = useAsyncFn(
        async (state: boolean) => {
            const pushTypes: Record<SocialSource, NotificationPushType | undefined> = {
                [Source.Farcaster]: NotificationPushType.Priority,
                [Source.Lens]: NotificationPushType.Lens,
                [Source.Twitter]: undefined,
            };
            const pushType = pushTypes[source];
            if (!pushType) return;

            await FireflySocialMediaProvider.setNotificationPushSwitch({
                list: [
                    {
                        platform: NotificationPlatform.Priority,
                        push_type: pushType,
                        state,
                    },
                ],
            });
            await refetch();
        },
        [source],
    );

    if (source === Source.Twitter) return null;

    return (
        <Popover className="relative flex items-center justify-center">
            <PopoverButton className="p-2">
                <SettingsIcon className="h-5 w-5 shrink-0" width={20} height={20} />
            </PopoverButton>
            <PopoverPanel
                anchor="bottom end"
                className="flex flex-col rounded-lg bg-lightBottom p-3 text-main shadow-lightS3 dark:bg-darkBottom"
            >
                <div className="flex items-center">
                    <div className="mr-3 text-sm font-bold leading-[18px]">
                        {
                            {
                                [Source.Farcaster]: <Trans>Priority Mode</Trans>,
                                [Source.Lens]: <Trans>High-signal Filter</Trans>,
                            }[source]
                        }
                    </div>
                    <Switch
                        disabled={isLoading || loading}
                        checked={enabled}
                        onChange={onSwitch}
                        className="group inline-flex h-[22px] w-11 items-center rounded-full bg-second transition data-[checked]:bg-lightHighlight dark:bg-bg data-[checked]:dark:bg-lightHighlight"
                    >
                        <span className="flex size-4 translate-x-1 items-center justify-center rounded-full bg-white transition group-data-[checked]:translate-x-6">
                            {loading || isLoading ? (
                                <LoadingIcon className="size-3 animate-spin text-darkBottom" width={12} height={12} />
                            ) : null}
                        </span>
                    </Switch>
                </div>
            </PopoverPanel>
        </Popover>
    );
}
