'use client';

import { t, Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import { Switch } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { first } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';
import { useAsyncFn } from 'react-use';
import { useAccount } from 'wagmi';

import LoadingIcon from '@/assets/loading.svg';
import WalletIcon from '@/assets/wallet.svg';
import { AccountCard } from '@/components/Login/AccountCard.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { ConnectWalletModalRef, LoginModalRef } from '@/modals/controls.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useLensStateStore } from '@/store/useLensStore.js';

interface LoginLensProps {}

export function LoginLens(props: LoginLensProps) {
    const [selected, setSelected] = useState<Profile>();
    const [signless, setSignless] = useState(true);

    const account = useAccount();

    const updateProfiles = useLensStateStore.use.updateProfiles();
    const updateCurrentProfile = useLensStateStore.use.updateCurrentProfile();

    const enqueueSnackbar = useCustomSnackbar();

    const { data: profiles } = useSuspenseQuery<Profile[]>({
        queryKey: ['lens', 'profiles', account.address],
        queryFn: async () => {
            if (!account.address) return EMPTY_LIST;
            return LensSocialMediaProvider.getProfilesByAddress(account.address);
        },
    });

    const current = useMemo(() => selected ?? first(profiles), [selected, profiles]);

    const [{ loading }, login] = useAsyncFn(
        async (signless: boolean) => {
            if (!profiles?.length || !current) return;

            try {
                const session = await LensSocialMediaProvider.createSessionForProfileId(current.profileId);

                if (!current.signless && signless) {
                    await LensSocialMediaProvider.updateSignless(true);
                }
                if (current.signless && !signless) {
                    await LensSocialMediaProvider.updateSignless(false);
                }

                updateProfiles(profiles);
                updateCurrentProfile(current, session);
                enqueueSnackbar(t`Your Lens account is now connected`, { variant: 'success' });
                LoginModalRef.close();
            } catch (error) {
                enqueueSnackbar(error instanceof Error ? error.message : t`Failed to login`, { variant: 'error' });
                LoginModalRef.close();
            }
        },
        [profiles, current],
    );

    useEffect(() => {
        if (!current) return;
        if (!current.signless) setSignless(false);
    }, [current]);

    return (
        <div
            className="flex max-h-[535px] w-[600px] flex-col overflow-auto rounded-[12px] pb-[80px]"
            style={{ boxShadow: '0px 4px 30px 0px rgba(0, 0, 0, 0.10)' }}
        >
            <div className="flex min-h-[372px] w-full flex-col gap-[16px] p-[16px]">
                {profiles?.length ? (
                    <>
                        <div className="flex w-full flex-col gap-[16px] rounded-[8px] bg-lightBg px-[16px] py-[24px]">
                            <div className="w-full text-left text-[14px] leading-[16px] text-lightSecond">
                                <Trans>Sign the transaction to verify you are the owner of the selected profile</Trans>
                            </div>
                            {profiles?.map((profile) => (
                                <AccountCard
                                    key={profile.profileId}
                                    profile={profile}
                                    isSelected={current?.profileId === profile.profileId}
                                    onSelect={setSelected}
                                />
                            ))}
                        </div>
                        <div className="flex w-full flex-col gap-[8px] rounded-[8px] bg-lightBg px-[16px] py-[24px]">
                            <div className="flex items-center justify-between">
                                <span className="text-[14px] font-bold leading-[18px] text-lightMain">
                                    <Trans>Delegate Signing (Recommend)</Trans>
                                </span>
                                <Switch checked={signless} onChange={(e) => setSignless(e.target.checked)} />
                            </div>
                            <div className="w-full text-left text-[14px] leading-[16px] text-lightSecond">
                                <Trans>
                                    Allow Lens Manager to perform actions such as posting, liking, and commenting
                                    without the need to sign each transaction
                                </Trans>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex w-full flex-col gap-[8px] rounded-[8px] bg-lightBg px-[16px] py-[24px]">
                        <div className="w-full text-left text-[14px] leading-[16px] text-lightSecond">
                            <Trans>No Lens profile found. Please change to another wallet.</Trans>
                        </div>
                    </div>
                )}

                <div
                    className=" absolute bottom-0 left-0 flex w-full items-center justify-between rounded-b-[8px] bg-lightBottom80 p-[16px]"
                    style={{
                        boxShadow: 'box-shadow: -1px 0px 20px 0px rgba(0, 0, 0, 0.05)',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    <button
                        className="flex gap-[8px] py-[11px]"
                        onClick={async () => {
                            LoginModalRef.close();
                            await delay(300);
                            ConnectWalletModalRef.open();
                        }}
                    >
                        <WalletIcon width={20} height={20} />
                        <span className=" text-[14px] font-bold leading-[18px] text-lightSecond">
                            <Trans>Change Wallet</Trans>
                        </span>
                    </button>
                    <button
                        disabled={loading}
                        className=" flex w-[120px] items-center justify-center gap-[8px] rounded-[99px] bg-lightMain py-[11px] font-bold text-primaryBottom"
                        onClick={() => login(signless)}
                    >
                        {loading ? (
                            <LoadingIcon className="animate-spin" width={24} height={24} />
                        ) : (
                            <Trans>Sign</Trans>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
