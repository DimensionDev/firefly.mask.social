'use client';

import { Trans } from '@lingui/macro';
import { useEffect } from 'react';

import LogOutIcon from '@/assets/logout.svg';
import UserAddIcon from '@/assets/user-add.svg';
import { OnlineStatusIndicator } from '@/components/OnlineStatusIndicator.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import { WarpcastSignerRequestIndicator } from '@/components/WarpcastSignerRequestIndicator.js';
import { SocialPlatform } from '@/constants/enum.js';
import { Tippy } from '@/esm/Tippy.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { useProfiles } from '@/hooks/useProfiles.js';
import { useSwitchLensAccount } from '@/hooks/useSwitchLensAccount.js';
import { LoginModalRef, LogoutModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface AccountSettingsProps {
    source: SocialPlatform;
    profile: Profile;
}

export function AccountSettings({ source, profile }: AccountSettingsProps) {
    const { currentProfile, currentProfileSession, profiles, refreshProfiles } = useProfiles(source);
    const { login } = useSwitchLensAccount();

    useEffect(() => {
        refreshProfiles();
    }, [refreshProfiles]);

    return (
        <Tippy
            placement="top-start"
            duration={200}
            arrow={false}
            trigger="click"
            hideOnClick
            interactive
            className="account-settings"
            content={
                <div className=" flex w-[290px] flex-col rounded-2xl bg-primaryBottom px-5 shadow-[0px_8px_20px_0px_rgba(0,0,0,0.04)] dark:border dark:border-line dark:shadow-[0px_8px_20px_0px_rgba(255,255,255,0.04)]">
                    {profiles.map((profile) => (
                        <button
                            key={profile.profileId}
                            className="my-6 flex items-center justify-between gap-2"
                            disabled={isSameProfile(currentProfile, profile) || source === SocialPlatform.Farcaster}
                            onClick={() => {
                                login(profile);
                            }}
                        >
                            <ProfileAvatar profile={profile} clickable linkable />
                            <ProfileName profile={profile} />
                            <WarpcastSignerRequestIndicator session={currentProfileSession}>
                                {isSameProfile(currentProfile, profile) ? <OnlineStatusIndicator /> : null}
                            </WarpcastSignerRequestIndicator>
                        </button>
                    ))}
                    <button
                        className="flex w-full items-center gap-2 rounded px-1 py-3 text-main hover:bg-bg"
                        onClick={() => {
                            LoginModalRef.open();
                        }}
                    >
                        <UserAddIcon width={24} height={24} />
                        <div className=" whitespace-nowrap text-[17px] font-bold leading-[22px] text-main">
                            <Trans>Connect another account</Trans>
                        </div>
                    </button>
                    <button
                        className="mb-3 flex items-center gap-2 rounded px-1 py-3 hover:bg-bg"
                        onClick={() => {
                            LogoutModalRef.open({ source });
                        }}
                    >
                        <LogOutIcon width={24} height={24} />
                        <div className=" text-[17px] font-bold leading-[22px] text-danger">
                            <Trans>Log out</Trans>
                        </div>
                    </button>
                </div>
            }
        >
            <div className="flex justify-center">
                <ProfileAvatar profile={profile} clickable />
            </div>
        </Tippy>
    );
}
