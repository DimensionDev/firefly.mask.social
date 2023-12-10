'use client';

import { SocialPlatform } from '@/constants/enum.js';
import { LoginModalRef } from '@/modals/controls.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileAvatarAdd } from '@/components/ProfileAvatarAdd.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';
import { AccountSetting } from '@/components/AccountSetting.js';

export function LoginStatusBar() {
    const lensProfile = useLensStateStore.use.currentProfile?.();
    const farcasterProfile = useFarcasterStateStore.use.currentProfile?.();

    return (
        <div className="flex gap-x-2 pl-2">
            {lensProfile ? (
                <div className="group relative">
                    <ProfileAvatar
                        profile={lensProfile}

                    />
                    <AccountSetting platform={SocialPlatform.Lens} />
                </div>
            ) : null}
            {farcasterProfile ? (
                <div className="group relative">
                    <ProfileAvatar
                        profile={farcasterProfile}
                    />
                    <AccountSetting platform={SocialPlatform.Farcaster} />
                </div>
            ) : null}
            {lensProfile ? null : (
                <ProfileAvatarAdd
                    platform={SocialPlatform.Lens}
                    onClick={() => LoginModalRef.open({ platform: SocialPlatform.Lens })}
                />
            )}
            {farcasterProfile ? null : (
                <ProfileAvatarAdd
                    platform={SocialPlatform.Farcaster}
                    onClick={() => LoginModalRef.open({ platform: SocialPlatform.Farcaster })}
                />
            )}
        </div>
    );
}
