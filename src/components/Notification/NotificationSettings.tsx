'use client';

import { Popover, PopoverButton, PopoverPanel, Switch } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import SettingsIcon from '@/assets/setting.svg';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

export function NotificationSettings() {
    const [enabled, setEnabled] = useState(false); // TODO: enable from server
    const [{ loading }, onSwitch] = useAsyncFn(async (checked: boolean) => {
        await delay(1000); // TODO: replace to api call
        setEnabled(checked);
    }, []);

    const { isLoading } = useQuery({
        queryKey: ['notification-push-switch'],
        async queryFn() {
            return FireflySocialMediaProvider.getNotificationPushSwitch();
        },
    });

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
                        <Trans>Priority Mode</Trans>
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
