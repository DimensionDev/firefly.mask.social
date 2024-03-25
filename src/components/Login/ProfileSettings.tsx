'use client';

import { Trans } from '@lingui/macro';
import { useEffect } from 'react';

import LogOutIcon from '@/assets/logout.svg';
import UserAddIcon from '@/assets/user-add.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { OnlineStatusIndicator } from '@/components/OnlineStatusIndicator.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import { WarpcastSignerRequestIndicator } from '@/components/WarpcastSignerRequestIndicator.js';
import { SocialPlatform } from '@/constants/enum.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { useProfiles } from '@/hooks/useProfiles.js';
import { useSwitchLensAccount } from '@/hooks/useSwitchLensAccount.js';
import { LoginModalRef, LogoutModalRef } from '@/modals/controls.js';

interface ProfileSettingsProps {
    source: SocialPlatform;
}

export function ProfileSettings({ source }: ProfileSettingsProps) {
    const { currentProfile, currentProfileSession, profiles, refreshProfiles } = useProfiles(source);
    const { login } = useSwitchLensAccount();

    useEffect(() => {
        refreshProfiles();
    }, [refreshProfiles]);

    return (
        <div className=" flex flex-col overflow-x-hidden rounded-2xl bg-primaryBottom shadow-[0px_8px_20px_0px_rgba(0,0,0,0.04)] md:w-[290px] md:px-5 md:dark:border md:dark:border-line md:dark:shadow-[0px_8px_20px_0px_rgba(255,255,255,0.04)]">
            {profiles.map((profile) => (
                <ClickableButton
                    key={profile.profileId}
                    className="my-3 flex items-center justify-between gap-2"
                    disabled={isSameProfile(currentProfile, profile) || source === SocialPlatform.Farcaster}
                    onClick={() => login(profile)}
                >
                    <ProfileAvatar profile={profile} clickable linkable />
                    <ProfileName profile={profile} />
                    <WarpcastSignerRequestIndicator session={currentProfileSession}>
                        {isSameProfile(currentProfile, profile) ? <OnlineStatusIndicator /> : null}
                    </WarpcastSignerRequestIndicator>
                </ClickableButton>
            ))}
            <ClickableButton
                className="flex w-full items-center rounded px-1 py-3 text-main hover:bg-bg"
                onClick={() => LoginModalRef.open()}
            >
                <UserAddIcon width={24} height={24} />
                <span className=" pl-2 text-[17px] font-bold leading-[22px] text-main">
                    <Trans>Switch account</Trans>
                </span>
            </ClickableButton>
            <ClickableButton
                className="mb-3 flex items-center rounded px-1 py-3 hover:bg-bg"
                onClick={() => LogoutModalRef.open({ source })}
            >
                <LogOutIcon width={24} height={24} />
                <span className=" pl-2 text-[17px] font-bold leading-[22px] text-danger">
                    <Trans>Log out</Trans>
                </span>
            </ClickableButton>
        </div>
    );
}
