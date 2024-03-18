'use client';

import { ProfileSettings } from '@/components/Login/ProfileSettings.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { SocialPlatform } from '@/constants/enum.js';
import { Tippy } from '@/esm/Tippy.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfileAvatarTipProps {
    source: SocialPlatform;
    profile: Profile;
}

export function ProfileAvatarTip({ source, profile }: ProfileAvatarTipProps) {
    return (
        <Tippy
            placement="top-start"
            duration={200}
            arrow={false}
            trigger="click"
            hideOnClick
            interactive
            className="account-settings"
            content={<ProfileSettings source={profile.source} />}
        >
            <div className="flex justify-center">
                <ProfileAvatar profile={profile} clickable />
            </div>
        </Tippy>
    );
}
