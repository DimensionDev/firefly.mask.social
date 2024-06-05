'use client';

import { Popover } from '@headlessui/react';
import { delay } from '@masknet/kit';

import { ProfileSettings } from '@/components/Login/ProfileSettings.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { DraggablePopoverRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useNavigatorState } from '@/store/useNavigatorStore.js';

interface ProfileAvatarInteractiveProps {
    profile: Profile;
}

export function ProfileAvatarInteractive({ profile }: ProfileAvatarInteractiveProps) {
    const { updateSidebarOpen } = useNavigatorState();
    const isMedium = useIsMedium();

    if (!isMedium) {
        return (
            <div
                className="flex justify-center"
                onClick={async () => {
                    updateSidebarOpen(false);
                    await delay(300);
                    DraggablePopoverRef.open({
                        content: <ProfileSettings source={profile.source} />,
                    });
                }}
            >
                <ProfileAvatar profile={profile} clickable />
            </div>
        );
    }

    return (
        <Popover as="div" className="relative">
            {({ close }) => (
                <>
                    <Popover.Button as="div">
                        <ProfileAvatar profile={profile} clickable />
                    </Popover.Button>
                    <Popover.Panel className="absolute top-[-12px] translate-y-[-100%]">
                        <ProfileSettings source={profile.source} onClose={() => close()} />
                    </Popover.Panel>
                </>
            )}
        </Popover>
    );
}
