'use client';

import { Trans } from '@lingui/macro';
import { useMediaQuery } from 'usehooks-ts';

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

interface AccountSettingProps {
    source: SocialPlatform;
    profile: Profile;
}

export function AccountSetting({ source, profile }: AccountSettingProps) {
    const { currentProfile, currentProfileSession, profiles } = useProfiles(source);
    const { login } = useSwitchLensAccount();

    const isLarge = useMediaQuery('(min-width: 1265px)');

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
                <div className="flex w-[260px] flex-col gap-[23px] rounded-2xl bg-primaryBottom p-6 shadow-[0px_8px_20px_0px_rgba(0,0,0,0.04)] dark:bg-bg dark:shadow-[0px_8px_20px_0px_rgba(255,255,255,0.04)]">
                    <div className='p-6'>
                        {profiles.map((profile) => (
                            <button
                                key={profile.profileId}
                                className="flex items-center justify-between gap-[8px]"
                                disabled={isSameProfile(currentProfile, profile) || source === SocialPlatform.Lens}
                                onClick={() => {
                                    login(profile);
                                }}
                            >
                                <ProfileAvatar profile={profile} />
                                <ProfileName profile={profile} />
                                <WarpcastSignerRequestIndicator session={currentProfileSession}>
                                    {isSameProfile(currentProfile, profile) ? <OnlineStatusIndicator /> : null}
                                </WarpcastSignerRequestIndicator>
                            </button>
                        ))}
                    </div>
                    <button
                        className="flex w-full items-center gap-2 px-6 py-3 text-main hover:bg-bg"
                        onClick={() => {
                            LoginModalRef.open();
                        }}
                    >
                        <UserAddIcon width={24} height={24} />
                        <div className=" text-[17px] font-bold leading-[22px] text-main">
                            <Trans>Change account</Trans>
                        </div>
                    </button>
                    <button
                        className="flex items-center gap-2 px-6 py-3 hover:bg-bg"
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
                <ProfileAvatar profile={profile} size={isLarge ? 40 : 36} />
            </div>
        </Tippy>
    );
}
