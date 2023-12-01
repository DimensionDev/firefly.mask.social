'use client';

import { t, Trans } from '@lingui/macro';
import { Switch } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { first } from 'lodash-es';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { useAsyncFn } from 'react-use';
import { useAccount, useDisconnect } from 'wagmi';

import { AccountCard } from '@/components/LoginLens/AccountCard.js';
import { SocialPlatform } from '@/constants/enum.js';
import { Image } from '@/esm/Image.js';
import { isValidAddress } from '@/maskbook/packages/web3-shared/evm/src/index.js';
import { LoginModalRef } from '@/modals/controls.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { useLensStateStore } from '@/store/useLensStore.js';
import type { Account } from '@/types/index.js';

interface LoginLensProps {
    back: () => void;
}

export function LoginLens({ back }: LoginLensProps) {
    const [selected, setSelected] = useState<Account | undefined>();
    const [signless, setSignless] = useState(true);

    const account = useAccount();
    const { disconnect } = useDisconnect();

    const updateAccounts = useLensStateStore.use.updateAccounts();
    const updateCurrentAccount = useLensStateStore.use.updateCurrentAccount();

    const { enqueueSnackbar } = useSnackbar();

    const { data: accounts } = useSuspenseQuery<Account[]>({
        queryKey: ['lens', 'accounts', account.address],
        queryFn: async () => {
            if (!account.address || !isValidAddress(account.address)) return [];
            const profiles = await LensSocialMediaProvider.getProfilesByAddress(account.address);

            const result = profiles.map<Account>((profile) => ({
                name: profile.nickname,
                avatar: profile.pfp,
                profileId: profile.displayName,
                id: profile.profileId,
                signless: profile.signless,
                handle: profile.handle,
                platform: SocialPlatform.Lens,
            }));

            if (!result.length) {
                enqueueSnackbar(t`No Lens profile found. Please change another wallet`, { variant: 'error' });
                LoginModalRef.close();
                return [];
            }

            // update current select and global lens accounts
            updateAccounts(result);

            return result;
        },
    });

    const current = useMemo(() => selected ?? first(accounts), [selected, accounts]);

    const [, login] = useAsyncFn(
        async (signless: boolean) => {
            if (!accounts || !current) return;
            await LensSocialMediaProvider.createSessionForProfileId(current.id);
            if (!current.signless && signless) {
                await LensSocialMediaProvider.updateSignless(true);
            }
            if (current.signless && !signless) {
                await LensSocialMediaProvider.updateSignless(false);
            }
            updateCurrentAccount(current);
            enqueueSnackbar(t`Your Lens account is now connected`, { variant: 'success' });
            LoginModalRef.close();
        },
        [accounts, current],
    );

    useEffect(() => {
        if (!current) return;
        if (!current.signless) setSignless(false);
    }, [current]);

    return (
        <div
            className="flex w-[600px] max-h-[535px] flex-col rounded-[12px] overflow-auto pb-[80px]"
            style={{ boxShadow: '0px 4px 30px 0px rgba(0, 0, 0, 0.10)' }}
        >
            <div className="flex min-h-[372px] w-full flex-col gap-[16px] p-[16px]">
                <div className="flex w-full flex-col gap-[16px] rounded-[8px] bg-lightBg px-[16px] py-[24px]">
                    <div className="w-full text-left text-[14px] leading-[16px] text-lightSecond">
                        <Trans>Sign the transaction to verify you are the owner of the selected profile</Trans>
                    </div>
                    {accounts?.map((account) => (
                        <AccountCard
                            key={account.id}
                            {...account}
                            isCurrent={current?.id === account.id}
                            setAccount={setSelected}
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
                            Allow Lens Manager to perform actions such as posting, liking, and commenting without the
                            need to sign each transaction
                        </Trans>
                    </div>
                </div>
                <div
                    className=" absolute bottom-0 left-0 flex w-full items-center justify-between rounded-b-[8px] bg-lightBottom80 p-[16px]"
                    style={{
                        boxShadow: 'box-shadow: -1px 0px 20px 0px rgba(0, 0, 0, 0.05)',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    <button
                        className="flex gap-[8px] py-[11px]"
                        onClick={() => {
                            disconnect();
                            back();
                        }}
                    >
                        <Image src="/svg/wallet.svg" alt="wallet" width={20} height={20} />
                        <span className=" text-[14px] font-bold leading-[18px] text-lightSecond">
                            <Trans>Change Wallet</Trans>
                        </span>
                    </button>
                    <button
                        className="flex w-[120px] items-center justify-center gap-[8px] rounded-[99px] bg-lightMain py-[11px] text-primaryBottom"
                        onClick={() => login(signless)}
                    >
                        <Trans>Sign</Trans>
                    </button>
                </div>
            </div>
        </div>
    );
}
