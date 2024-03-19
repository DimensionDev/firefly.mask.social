'use client';

import { t, Trans } from '@lingui/macro';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { useCallback, useState } from 'react';
import { useCopyToClipboard } from 'usehooks-ts';
import { useAccount } from 'wagmi';

import { AccountCard } from '@/app/(settings)/components/AccountCard.js';
import { Headline } from '@/app/(settings)/components/Headline.js';
import { Section } from '@/app/(settings)/components/Section.js';
import CopyIcon from '@/assets/copy.svg';
import { Tippy } from '@/esm/Tippy.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { LoginModalRef, LogoutModalRef } from '@/modals/controls.js';
import { useFarcasterStateStore, useLensStateStore } from '@/store/useProfileStore.js';

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

    useNavigatorTitle(t`Connected Accounts`);

    return (
        <Section>
            <Headline>
                <Trans>Connected Accounts</Trans>
            </Headline>

            {currentLensProfile?.profileId ? (
                <>
                    <div className="flex w-full items-center justify-between">
                        <span className="text-base font-bold leading-[18px] text-main">
                            <Trans>Lens</Trans>
                        </span>
                        <div className="flex items-center gap-1">
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
                    <div className=" flex w-full flex-col gap-4">
                        {lensProfiles.map((profile) => (
                            <AccountCard
                                key={profile.profileId}
                                profile={profile}
                                isCurrent={isSameProfile(currentLensProfile, profile)}
                            />
                        ))}
                    </div>
                </>
            ) : null}

            {currentFarcasterProfile?.profileId ? (
                <>
                    <div className="flex w-full items-center justify-between">
                        <span className="text-base font-bold leading-[18px] text-main">
                            <Trans>Farcaster</Trans>
                        </span>
                    </div>
                    <div className=" flex w-full flex-col gap-4">
                        {farcasterProfiles.map((profile) => (
                            <AccountCard
                                key={profile.profileId}
                                profile={profile}
                                isCurrent={isSameProfile(currentFarcasterProfile, profile)}
                            />
                        ))}
                    </div>
                </>
            ) : null}

            <div className="flex items-center gap-4">
                <button
                    className="inline-flex h-10 w-[200px] flex-col items-center justify-center"
                    onClick={() => {
                        LoginModalRef.open();
                    }}
                >
                    <div className="inline-flex h-10 items-center justify-center gap-2 self-stretch rounded-2xl bg-lightMain py-[11px]">
                        <div className="w-full text-[15px] font-bold leading-[18px] text-primaryBottom">
                            <Trans>Add account</Trans>
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
        </Section>
    );
}
