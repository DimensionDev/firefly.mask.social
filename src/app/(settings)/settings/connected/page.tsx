'use client';

import { Trans } from '@lingui/macro';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { useCallback, useState } from 'react';
import { useCopyToClipboard } from 'usehooks-ts';
import { useAccount } from 'wagmi';

import { AccountCard } from '@/app/(settings)/components/AccountCard.js';
import CopyIcon from '@/assets/copy.svg';
import { Tippy } from '@/esm/Tippy.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { LoginModalRef, LogoutModalRef } from '@/modals/controls.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

export default function Connected() {
    const { address } = useAccount();
    const [timer, setTimer] = useState<NodeJS.Timeout>();

    const lensProfiles = useLensStateStore.use.profiles();
    const farcasterProfiles = useFarcasterStateStore.use.profiles();
    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();
    const [, copyToClipboard] = useCopyToClipboard();

    const handleClick = useCallback(() => {
        if (!address) return;
        copyToClipboard(address);
    }, [address, copyToClipboard]);

    return (
        <div className="flex w-full flex-col items-center gap-[24px] p-[24px]">
            <div className=" flex w-full items-center justify-between gap-[24px]">
                <span className="text-[20px] font-bold leading-[24px] text-main">
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
                            <span className="text-base font-bold leading-[18px] text-second">
                                {address ? formatEthereumAddress(address, 4) : null}
                            </span>
                            <Tippy
                                content={'copied'}
                                placement="top"
                                duration={200}
                                trigger="click"
                                onShow={(instance) => {
                                    if (timer) clearTimeout(timer);
                                    setTimer(
                                        setTimeout(() => {
                                            instance.hide();
                                        }, 1000),
                                    );
                                }}
                            >
                                <button
                                    onClick={() => {
                                        handleClick();
                                    }}
                                >
                                    <CopyIcon width={14} height={14} />
                                </button>
                            </Tippy>
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
                <button
                    className="inline-flex h-10 w-[200px] flex-col items-center justify-center"
                    onClick={() => {
                        LoginModalRef.open();
                    }}
                >
                    <div className="inline-flex h-10 items-center justify-center gap-2 self-stretch rounded-2xl bg-lightMain py-[11px]">
                        <div className="text-[15px] font-bold leading-[18px] text-primaryBottom w-full">
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
                    <div className="inline-flex h-10 items-center justify-center gap-2 self-stretch rounded-2xl bg-danger px-[18px] py-[11px]">
                        <div className="text-[15px] font-bold leading-[18px] text-white dark:text-lightMain">
                            <Trans>Log out all</Trans>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}
