'use client';

import { AccountSetting } from '@/components/AccountSetting.js';
import { ProfileAvatarAdd } from '@/components/ProfileAvatarAdd.js';
import { SocialPlatform } from '@/constants/enum.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { LoginModalRef } from '@/modals/controls.js';
import { useFarcasterStateStore, useLensStateStore } from '@/store/useProfileStore.js';

export function LoginStatusBar() {
    const lensProfile = useLensStateStore.use.currentProfile?.();
    const farcasterProfile = useFarcasterStateStore.use.currentProfile?.();

    return (
        <div className="relative flex md:flex-col md:justify-center md:gap-y-2 lg:flex-row lg:justify-start lg:gap-x-2 lg:pl-2">
            {lensProfile ? <AccountSetting source={SocialPlatform.Lens} profile={lensProfile} /> : null}
            {farcasterProfile ? <AccountSetting source={SocialPlatform.Farcaster} profile={farcasterProfile} /> : null}
            {lensProfile ? null : (
                <ProfileAvatarAdd
                    source={SocialPlatform.Lens}
                    onClick={async () => {
                        await getWalletClientRequired();
                        LoginModalRef.open({ source: SocialPlatform.Lens });
                    }}
                />
            )}
            {farcasterProfile ? null : (
                <ProfileAvatarAdd
                    source={SocialPlatform.Farcaster}
                    onClick={() => LoginModalRef.open({ source: SocialPlatform.Farcaster })}
                />
            )}
        </div>
    );
}
