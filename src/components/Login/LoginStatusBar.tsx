'use client';

import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileAvatarAdd } from '@/components/ProfileAvatarAdd.js';
import { SocialPlatform } from '@/constants/enum.js';
import { LoginModalRef, ProfileStatusModal } from '@/modals/controls.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

export function LoginStatusBar() {
    const lensProfile = useLensStateStore.use.currentProfile?.();
    const farcasterProfile = useFarcasterStateStore.use.currentProfile?.();

    return (
        <div className="flex gap-x-2 pl-2">
            {lensProfile ? (
                <ProfileAvatar
                    profile={lensProfile}
                    onClick={() => {
                        ProfileStatusModal.open({
                            platform: SocialPlatform.Lens,
                        });
                    }}
                />
            ) : null}
            {farcasterProfile ? (
                <ProfileAvatar
                    profile={farcasterProfile}
                    onClick={() => {
                        ProfileStatusModal.open({
                            platform: SocialPlatform.Farcaster,
                        });
                    }}
                />
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
