'use client';

import { CloudIcon } from '@heroicons/react/24/outline';
import { Trans } from '@lingui/macro';
import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

import LogOutIcon from '@/assets/logout.svg';
import UserAddIcon from '@/assets/user-add.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { OnlineStatusIndicator } from '@/components/OnlineStatusIndicator.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import { SocialPlatform } from '@/constants/enum.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { useProfileStore } from '@/hooks/useProfileStore.js';
import { useSwitchLensAccount } from '@/hooks/useSwitchLensAccount.js';
import { FireflySessionConfirmModalRef, LoginModalRef, LogoutModalRef } from '@/modals/controls.js';
import { createSessionForProfileIdFirefly } from '@/providers/lens/createSessionForProfileId.js';

interface ProfileSettingsProps {
    source: SocialPlatform;
}

export function ProfileSettings({ source }: ProfileSettingsProps) {
    const { currentProfile, profiles, refreshProfiles } = useProfileStore(source);
    const { login } = useSwitchLensAccount();

    useEffect(() => {
        refreshProfiles();
    }, [refreshProfiles]);

    return (
        <div className=" flex flex-col overflow-x-hidden rounded-2xl bg-primaryBottom md:w-[290px] md:border md:border-line md:px-5">
            {profiles.map((profile) => (
                <ClickableButton
                    key={profile.profileId}
                    className="my-3 flex items-center justify-between gap-2 outline-none"
                    disabled={isSameProfile(currentProfile, profile) || source === SocialPlatform.Farcaster}
                    onClick={() => login(profile)}
                >
                    <ProfileAvatar profile={profile} clickable linkable />
                    <ProfileName profile={profile} />

                    {isSameProfile(currentProfile, profile) ? <OnlineStatusIndicator /> : null}
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
            {currentProfile && source === SocialPlatform.Lens ? (
                <ClickableButton
                    className="flex w-full items-center rounded px-1 py-3 text-main outline-none hover:bg-bg"
                    onClick={async () => {
                        await createSessionForProfileIdFirefly(currentProfile.profileId);
                        await FireflySessionConfirmModalRef.openAndWaitForClose();
                    }}
                >
                    <CloudIcon width={24} height={24} />
                    <span className=" pl-2 text-[17px] font-bold leading-[22px] text-main">
                        <Trans>Detect device accounts</Trans>
                    </span>
                </ClickableButton>
            ) : null}
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
