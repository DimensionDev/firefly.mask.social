'use client';

import { Trans } from '@lingui/macro';
import { useDisconnect } from 'wagmi';

import LogOutIcon from '@/assets/logout.svg';
import UserAddIcon from '@/assets/user-add.svg';
import { PlatformIcon } from '@/components/PlatformIcon.js';
import { SocialPlatform } from '@/constants/enum.js';
import { Image } from '@/esm/Image.js';
import { LoginModalRef, LogoutModalRef } from '@/modals/controls.js';
import { useLensStateStore } from '@/store/useLensStore.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';

export function LensAccountSetting() {
    const lensAccounts = useLensStateStore.use.profiles();
    const currentAccount = useLensStateStore.use.currentProfile();
    const clearCurrentAccount = useLensStateStore.use.clearCurrentProfile();
    const { disconnect } = useDisconnect();

    return (
        <div className="absolute -top-[182px] hidden rounded-[12px] bg-bgModal group-hover:block">
            <div className="flex w-[260px] flex-col gap-[23px] rounded-[16px] p-[24px]">
                {lensAccounts.map((profile) => (
                    <div key={profile.profileId} className="flex items-center justify-between gap-[8px]">

                        <ProfileAvatar profile={profile} />
                        <ProfileName profile={profile} />
                        {currentAccount && currentAccount.profileId === profile.profileId ? (
                            <div
                                className="h-[8px] w-[8px] rounded-[99px] bg-success"
                                style={{ filter: 'drop-shadow(0px 4px 10px #3DC233)' }}
                            />
                        ) : null}
                    </div>
                ))}
                <button
                    className="flex w-full items-center gap-[8px]"
                    onClick={() => {
                        disconnect();
                        clearCurrentAccount();
                        LoginModalRef.open({});
                    }}
                >
                    <UserAddIcon width={24} height={24} />
                    <div className=" text-[17px] font-bold leading-[22px] text-[#101010] dark:text-gray-400">
                        <Trans>Change account</Trans>
                    </div>
                </button>
                <button
                    className="flex items-center gap-[8px]"
                    onClick={() => {
                        LogoutModalRef.open({ platform: SocialPlatform.Lens });
                    }}
                >
                    <LogOutIcon width={24} height={24} />
                    <div className=" text-[17px] font-bold leading-[22px] text-[#f00]">
                        <Trans>Log out</Trans>
                    </div>
                </button>
            </div>
        </div>
    );
}
