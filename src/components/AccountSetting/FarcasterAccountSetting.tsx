'use client';

import { Trans } from '@lingui/macro';
import { useDisconnect } from 'wagmi';

import LogoutIcon from '@/assets/logout.svg';
import UserAddIcon from '@/assets/user-add.svg';
import { PlatformIcon } from '@/components/PlatformIcon.js';
import { SocialPlatform } from '@/constants/enum.js';
import { Image } from '@/esm/Image.js';
import { LoginModalRef, LogoutModalRef } from '@/modals/controls.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';

export function FarcasterAccountSetting() {
    const { disconnect } = useDisconnect();
    const farcasterAccounts = useFarcasterStateStore.use.profiles();
    const currentAccount = useFarcasterStateStore.use.currentProfile();
    const clearCurrentAccount = useFarcasterStateStore.use.clearCurrentProfile();

    return (
        <div className="absolute -top-[180px] hidden rounded-[12px] bg-bgModal group-hover:block">
            <div className="flex w-[260px] flex-col gap-[23px] rounded-[16px] p-[24px]">
                {farcasterAccounts.map(({ pfp, profileId, displayName }) => (
                    <div key={profileId} className="flex items-center justify-between gap-[8px]">
                        <div className="flex h-[40px] w-[48px] items-start justify-start">
                            <div className="relative h-[40px] w-[40px]">
                                <div className="absolute left-0 top-0 h-[40px] w-[40px] rounded-[99px] shadow backdrop-blur-lg">
                                    <Image src={pfp} alt="avatar" width={40} height={36} />
                                </div>
                                <PlatformIcon
                                    className="absolute left-[24px] top-[24px] h-[16px] w-[16px] rounded-[99px] border border-white shadow"
                                    platform={SocialPlatform.Farcaster}
                                    size={16}
                                />
                            </div>
                        </div>
                        <div className="inline-flex h-[39px] shrink grow basis-0 flex-col items-start justify-center">
                            <div className=" text-[15px] font-medium text-main">{displayName}</div>
                            <div className=" text-[15px] font-normal text-lightSecond">@{profileId}</div>
                        </div>
                        {currentAccount && currentAccount.profileId === profileId ? (
                            <div
                                className="h-[8px] w-[8px] rounded-[99px] bg-[#3DC233]"
                                style={{ filter: 'drop-shadow(0px 4px 10px #3DC233)' }}
                            />
                        ) : null}
                    </div>
                ))}
                <button
                    className="flex w-full items-center gap-[8px]"
                    onClick={() => {
                        disconnect();
                        LoginModalRef.open({ platform: SocialPlatform.Farcaster });
                        clearCurrentAccount();
                    }}
                >
                    <UserAddIcon width={24} height={24} />
                    <div className=" text-[17px] font-bold leading-[22px] text-[#101010]">
                        <Trans>Change account</Trans>
                    </div>
                </button>
                <button
                    className="flex items-center gap-[8px]"
                    onClick={() => LogoutModalRef.open({ platform: SocialPlatform.Farcaster })}
                >
                    <LogoutIcon width={24} height={24} />
                    <div className=" text-[17px] font-bold leading-[22px] text-[#f00]">
                        <Trans>Log out</Trans>
                    </div>
                </button>
            </div>
        </div>
    );
}
