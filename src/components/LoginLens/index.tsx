'use client';

import { Switch } from '@mui/material';
import { useAccountModal } from '@rainbow-me/rainbowkit';
import { useState } from 'react';

import { AccountCard } from '@/components/LoginLens/AccountCard.js';
import { Image } from '@/esm/Image.js';
import { LensSocialMedia } from '@/providers/lens/SocialMedia.js';
import { type LensAccount, useLensAccountsStore } from '@/store/useAccountPersistStore.js';

interface LoginLensProps {
    onClose: () => void;
    accounts?: LensAccount[];
}

export function LoginLens({ onClose, accounts }: LoginLensProps) {
    const [currentAccount, setCurrentAccount] = useState<string>(accounts ? accounts[0].id : '');
    const { openAccountModal } = useAccountModal();
    const setLensAccounts = useLensAccountsStore.use.setAccounts();
    async function login() {
        if (!accounts) return;
        const lensProvider = new LensSocialMedia();
        await lensProvider.createSessionForProfileId(currentAccount);
        setLensAccounts(accounts.map((account) => ({ ...account, isCurrent: account.id === currentAccount })));
        onClose();
    }

    return (
        <div
            className="flex w-[600px] flex-col rounded-[12px]"
            style={{ boxShadow: '0px 4px 30px 0px rgba(0, 0, 0, 0.10)' }}
        >
            <div className="inline-flex h-[56px] w-full items-center justify-center gap-2 rounded-t-[12px] bg-gradient-to-b from-white to-white p-4">
                <button
                    onClick={() => {
                        onClose();
                    }}
                >
                    <Image
                        className="relative h-[24px] w-[24px]"
                        src="/svg/close.svg"
                        alt="close"
                        width={24}
                        height={24}
                    />
                </button>
                <div className="shrink grow basis-0 text-center font-['Helvetica'] text-lg font-bold leading-snug text-lightMain">
                    Select Account
                </div>
                <div className="relative h-[24px] w-[24px]" />
            </div>
            <div className="flex min-h-[372px] w-full flex-col gap-[16px] p-[16px]">
                <div className="flex w-full flex-col gap-[16px] rounded-[8px] bg-lightBg px-[16px] py-[24px]">
                    <div className="w-full text-left text-[14px] leading-[16px] text-lightSecond">
                        Sign the transaction to verify you are the owner of the selected profile
                    </div>
                    {accounts?.map((account) => (
                        <AccountCard
                            key={account.id}
                            avatar={account.avatar}
                            name={account.name}
                            userName={account.profileId}
                            id={account.id}
                            isCurrent={currentAccount === account.id}
                            setAccount={setCurrentAccount}
                        />
                    ))}
                </div>
                <div className="flex w-full flex-col gap-[8px] rounded-[8px] bg-lightBg px-[16px] py-[24px]">
                    <div className="flex items-center justify-between">
                        <span className="text-[14px] font-bold leading-[18px] text-lightMain">
                            Delegate Signing (Recommend)
                        </span>
                        <Switch checked />
                    </div>
                    <div className="w-full text-left text-[14px] leading-[16px] text-lightSecond">
                        Allow Lens Manager to perform actions such as posting, liking, and commenting without the need
                        to sign each transaction
                    </div>
                </div>
                <div
                    className=" absolute bottom-0 left-0 flex w-full items-center justify-between rounded-b-[8px] bg-lightBottom80 p-[16px]"
                    style={{
                        boxShadow: 'box-shadow: -1px 0px 20px 0px rgba(0, 0, 0, 0.05)',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    <button className="flex gap-[8px] py-[11px]" onClick={() => openAccountModal()}>
                        <Image src="/svg/wallet.svg" alt="wallet" width={20} height={20} />
                        <span className=" text-[14px] font-bold leading-[18px] text-lightSecond">Change Wallet</span>
                    </button>
                    <button
                        className="flex w-[120px] items-center justify-center gap-[8px] rounded-[99px] bg-lightMain py-[11px] text-primaryBottom"
                        onClick={() => login()}
                    >
                        Sign
                    </button>
                </div>
            </div>
        </div>
    );
}
