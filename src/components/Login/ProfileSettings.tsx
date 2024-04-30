'use client';

import { Trans } from '@lingui/macro';
import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

import LogOutIcon from '@/assets/logout.svg';
import UserAddIcon from '@/assets/user-add.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { OnlineStatusIndicator } from '@/components/OnlineStatusIndicator.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import { WarpcastSignerRequestIndicator } from '@/components/WarpcastSignerRequestIndicator.js';
import { NODE_ENV, SocialPlatform } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { useProfileStore } from '@/hooks/useProfileStore.js';
import { useSwitchLensAccount } from '@/hooks/useSwitchLensAccount.js';
import { LoginModalRef, LogoutModalRef } from '@/modals/controls.js';

interface ProfileSettingsProps {
    source: SocialPlatform;
}

export function ProfileSettings({ source }: ProfileSettingsProps) {
    const { currentProfile, currentProfileSession, profiles, refreshProfiles } = useProfileStore(source);
    const { login } = useSwitchLensAccount();

    useEffect(() => {
        refreshProfiles();
    }, [refreshProfiles]);

    return (
        <div className=" flex flex-col overflow-x-hidden rounded-2xl border border-line bg-primaryBottom md:w-[290px] md:px-5">
            {profiles.map((profile) => (
                <ClickableButton
                    key={profile.profileId}
                    className="my-3 flex items-center justify-between gap-2 outline-none"
                    disabled={isSameProfile(currentProfile, profile) || source === SocialPlatform.Farcaster}
                    onClick={() => login(profile)}
                >
                    <ProfileAvatar
                        profile={profile}
                        clickable={source !== SocialPlatform.Twitter}
                        linkable={source !== SocialPlatform.Twitter}
                    />
                    <ProfileName profile={profile} />

                    {env.shared.NODE_ENV === NODE_ENV.Development ? (
                        <WarpcastSignerRequestIndicator session={currentProfileSession}>
                            {isSameProfile(currentProfile, profile) ? <OnlineStatusIndicator /> : null}
                        </WarpcastSignerRequestIndicator>
                    ) : isSameProfile(currentProfile, profile) ? (
                        <OnlineStatusIndicator />
                    ) : null}
                </ClickableButton>
            ))}
            <ClickableButton
                className="flex w-full items-center rounded px-1 py-3 text-main outline-none hover:bg-bg"
                onClick={async () => {
                    if (source === SocialPlatform.Twitter)
                        await signOut({
                            redirect: false,
                        });
                    LoginModalRef.open({ source });
                }}
            >
                <UserAddIcon width={24} height={24} />
                <span className=" pl-2 text-[17px] font-bold leading-[22px] text-main">
                    <Trans>Switch account</Trans>
                </span>
            </ClickableButton>
            <ClickableButton
                className="mb-3 flex items-center rounded px-1 py-3 outline-none hover:bg-bg"
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
