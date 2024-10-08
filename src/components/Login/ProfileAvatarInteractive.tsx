'use client';

import { Popover } from '@headlessui/react';
import { delay } from '@masknet/kit';

import { ClickableArea } from '@/components/ClickableArea.js';
import { ProfileSettings } from '@/components/Login/ProfileSettings.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { useAsyncStatus } from '@/hooks/useAsyncStatus.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { DraggablePopoverRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useNavigatorState } from '@/store/useNavigatorStore.js';

interface ProfileAvatarInteractiveProps {
    profile: Profile;
    loading?: boolean;
}

export function ProfileAvatarInteractive({ profile, loading }: ProfileAvatarInteractiveProps) {
    const isMedium = useIsMedium();
    const { updateSidebarOpen } = useNavigatorState();

    const asyncStatus = useAsyncStatus(profile.source);
    const isLoading = loading || asyncStatus;

    if (!isMedium) {
        return (
            <ClickableArea
                className="flex justify-center"
                disabled={isLoading}
                onClick={async () => {
                    updateSidebarOpen(false);
                    await delay(300);
                    DraggablePopoverRef.open({
                        content: (
                            <ProfileSettings source={profile.source} onClose={() => DraggablePopoverRef.close()} />
                        ),
                    });
                }}
            >
                <ProfileAvatar profile={profile} clickable loading={isLoading} />
            </ClickableArea>
        );
    }

    return (
        <Popover as="div" className="relative">
            {({ close }) => (
                <>
                    <Popover.Button as="div" disabled={isLoading}>
                        <ProfileAvatar profile={profile} clickable loading={isLoading} />
                    </Popover.Button>
                    <Popover.Panel className="absolute top-[-12px] translate-y-[-100%]">
                        <ProfileSettings source={profile.source} onClose={() => close()} />
                    </Popover.Panel>
                </>
            )}
        </Popover>
    );
}
