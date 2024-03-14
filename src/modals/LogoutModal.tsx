'use client';

import { t, Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { useRouter } from 'next/navigation.js';
import { forwardRef, Fragment } from 'react';

import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import { SocialPlatform } from '@/constants/enum.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useFarcasterStateStore, useLensStateStore } from '@/store/useProfileStore.js';

export interface LogoutModalProps {
    source?: SocialPlatform;
    profile?: Profile;
}

export const LogoutModal = forwardRef<SingletonModalRefCreator<LogoutModalProps | void>>(function LogoutModal(_, ref) {
    const router = useRouter();

    const lensProfiles = useLensStateStore.use.profiles();
    const farcasterProfiles = useFarcasterStateStore.use.profiles();
    const clearLensProfile = useLensStateStore.use.clearCurrentProfile();
    const clearFarcasterProfile = useFarcasterStateStore.use.clearCurrentProfile();

    const [open, dispatch] = useSingletonModal(ref, {
        async onOpen(props) {
            let profiles: Profile[] = [];

            if (props?.profile) {
                profiles = [props.profile];
            } else {
                switch (props?.source) {
                    case SocialPlatform.Lens:
                        profiles = lensProfiles;
                        break;
                    case SocialPlatform.Farcaster:
                        profiles = farcasterProfiles;
                        break;
                    default:
                        profiles = [...lensProfiles, ...farcasterProfiles];
                        break;
                }
            }
            const confirmed = await ConfirmModalRef.openAndWaitForClose({
                title: t`Log out`,
                content: (
                    <>
                        <div className="text-[15px] font-medium leading-normal text-lightMain">
                            {profiles.length > 1 ? (
                                <Trans>Confirm to log out these accounts?</Trans>
                            ) : (
                                <Trans>Confirm to log out this account?</Trans>
                            )}
                        </div>
                        {profiles.map((profile) => (
                            <div
                                key={profile.profileId}
                                className="flex items-center justify-between gap-2 rounded-[8px] px-[12px] py-[8px] backdrop-blur-[8px]"
                                style={{ boxShadow: '0px 0px 20px 0px var(--color-bottom-bg)' }}
                            >
                                <ProfileAvatar profile={profile} size={36} />
                                <ProfileName profile={profile} />
                            </div>
                        ))}
                    </>
                ),
            });
            if (!confirmed) return;

            switch (props?.source || props?.profile?.source) {
                case SocialPlatform.Lens:
                    clearLensProfile();
                    break;
                case SocialPlatform.Farcaster:
                    clearFarcasterProfile();
                    break;
                default:
                    clearLensProfile();
                    clearFarcasterProfile();
                    break;
            }
            dispatch?.close();
            await delay(300);
            router.push('/');
        },
    });

    return null;
});
