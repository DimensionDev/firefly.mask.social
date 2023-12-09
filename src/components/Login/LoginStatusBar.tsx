'use client';

import { FarcasterAccountSetting } from '@/components/AccountSetting/FarcasterAccountSetting.js';
import { LensAccountSetting } from '@/components/AccountSetting/LensAccountSetting.js';
import { SocialPlatform } from '@/constants/enum.js';
import { LoginModalRef } from '@/modals/controls.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileAvatarAdd } from '@/components/ProfileAvatarAdd.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

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
                    <LensAccountSetting />
                </div>
            ) : null}
            {farcasterProfile ? (
                <div className="group relative">
                    <ProfileAvatar
                        profile={farcasterProfile}
                    />
                    <FarcasterAccountSetting />
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
