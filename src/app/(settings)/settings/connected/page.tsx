'use client';

import { Trans } from '@lingui/macro';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { useAccount } from 'wagmi';

import CopyIcon from '@/assets/copy.svg';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { LogoutModalRef } from '@/modals/controls.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

import { AccountCard } from './AccountCard/index.js';

export default function Connected() {
    const { address } = useAccount();

    const lensProfiles = useLensStateStore.use.profiles();
    const farcasterProfiles = useFarcasterStateStore.use.profiles();
    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();

    return (
        <div className="flex w-full flex-col items-center gap-[24px] p-[24px]">
            <div className=" flex w-full items-center justify-between gap-[24px]">
                <span className="text-[18px] font-bold leading-[24px] text-main">
                    <Trans>Connected Accounts</Trans>
                </span>
            </div>
            {currentLensProfile?.profileId ? (
                <>
                    <div className="flex w-full items-center justify-between">
                        <span className="text-base font-bold leading-[18px] text-main">
                            <Trans>Lens</Trans>
                        </span>
                        <div className="flex items-center gap-[4px]">
                            <span className="text-base font-bold leading-[18px] text-slate-500">
                                {address ? formatEthereumAddress(address, 4) : null}
                            </span>
                            <CopyIcon width={14} height={14} />
                        </div>
                    </div>
                    {lensProfiles.map((profile) => (
                        <AccountCard
                            key={profile.profileId}
                            profile={profile}
                            isCurrent={isSameProfile(currentLensProfile, profile)}
                        />
                    ))}
                </>
            ) : null}
            {currentFarcasterProfile?.profileId ? (
                <>
                    <div className="flex w-full items-center justify-between">
                        <span className="text-base font-bold leading-[18px] text-main">
                            <Trans>Farcaster</Trans>
                        </span>
                    </div>
                    {farcasterProfiles.map((profile) => (
                        <AccountCard
                            key={profile.profileId}
                            profile={profile}
                            isCurrent={isSameProfile(currentFarcasterProfile, profile)}
                        />
                    ))}
                </>
            ) : null}
            <div className="flex items-center gap-[16px]">
                <button className="inline-flex h-10 w-[200px] flex-col items-center justify-center">
                    <div className="inline-flex h-10 items-center justify-center gap-2 self-stretch rounded-2xl bg-lightMain px-[18px] py-[11px]">
                        <div className="text-sm font-bold leading-[18px] text-primaryBottom">
                            <Trans>Add an existing account</Trans>
                        </div>
                    </div>
                </button>

                <button
                    className="inline-flex h-10 w-[200px] flex-col items-start justify-start"
                    onClick={() => {
                        LogoutModalRef.open();
                    }}
                >
                    <div className="inline-flex h-10 items-center justify-center gap-2 self-stretch rounded-2xl bg-[#FF3545] px-[18px] py-[11px]">
                        <div className="text-sm font-bold leading-[18px] text-lightMain">
                            <Trans>Log out all</Trans>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}
