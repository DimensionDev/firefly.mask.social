'use client';

import { ProfileAvatarAdd } from '@/components/Login/ProfileAvatarAdd.js';
import { ProfileAvatarTip } from '@/components/Login/ProfileAvatarTip.js';
import { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { LoginModalRef } from '@/modals/controls.js';
import { useFarcasterStateStore, useLensStateStore } from '@/store/useProfileStore.js';

interface LoginStatusBarProps {
    collapsed?: boolean;
}

export function LoginStatusBar({ collapsed = false }: LoginStatusBarProps) {
    const lensProfile = useLensStateStore.use.currentProfile?.();
    const farcasterProfile = useFarcasterStateStore.use.currentProfile?.();

    return (
        <div
            className={classNames('relative flex', {
                'flex-col justify-center gap-y-2': collapsed,
                'flex-row justify-start gap-x-2 pl-6 lg:pl-2': !collapsed,
            })}
        >
            {farcasterProfile ? (
                <ProfileAvatarTip source={SocialPlatform.Farcaster} profile={farcasterProfile} />
            ) : null}
            {lensProfile ? <ProfileAvatarTip source={SocialPlatform.Lens} profile={lensProfile} /> : null}
            {farcasterProfile ? null : (
                <ProfileAvatarAdd
                    source={SocialPlatform.Farcaster}
                    onClick={() => LoginModalRef.open({ source: SocialPlatform.Farcaster })}
                />
            )}
            {lensProfile ? null : (
                <ProfileAvatarAdd
                    source={SocialPlatform.Lens}
                    onClick={async () => {
                        await getWalletClientRequired();
                        LoginModalRef.open({ source: SocialPlatform.Lens });
                    }}
                />
            )}
        </div>
    );
}
