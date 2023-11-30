'use client';

import { Trans } from '@lingui/macro';
import { useAccount } from 'wagmi';

import { SocialPlatform } from '@/constants/enum.js';
import { Image } from '@/esm/Image.js';
import { LogoutModalRef } from '@/modals/controls.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

import { AccountCard } from './AccountCard/index.js';

export default function Connected() {
    const { address } = useAccount()
    const lensAccounts = useLensStateStore.use.accounts();
    const farcasterAccounts = useFarcasterStateStore.use.accounts();
    const currentLensAccount = useLensStateStore.use.currentAccount();
    const currentFarcasterAccount = useFarcasterStateStore.use.currentAccount();

    return (
        <div className="flex w-full flex-col items-center gap-[24px] p-[24px]">
            <div className=" flex w-full items-center justify-between gap-[24px]">
                <span className="text-[18px] font-bold leading-[24px] text-main">
                    <Trans>Connected Accounts</Trans>
                </span>
            </div>
            {currentLensAccount.id ? <>
                <div className="flex w-full items-center justify-between">
                    <span className="text-base font-bold leading-[18px] text-main">
                        <Trans>Lens</Trans>
                    </span>
                    <div className="flex items-center gap-[4px]">
                        <span className="text-base font-bold leading-[18px] text-slate-500">{address}</span>
                        <Image src="/svg/copy.svg" alt="copy" width={14} height={14} />
                    </div>
                </div>
                {lensAccounts.map(({ avatar, profileId, id, name }) => (
                    <AccountCard
                        key={id}
                        avatar={avatar}
                        name={name}
                        userName={profileId}
                        isCurrent={currentLensAccount?.id === id}
                        type={SocialPlatform.Lens}
                        logout={() => { }}
                    />
                ))}
            </> : null}
            {currentFarcasterAccount.id ? <>
                <div className="flex w-full items-center justify-between">
                    <span className="text-base font-bold leading-[18px] text-main">
                        <Trans>Farcaster</Trans>
                    </span>
                </div>
                {farcasterAccounts.map(({ avatar, profileId, id, name }) => (
                    <AccountCard
                        key={id}
                        avatar={avatar}
                        name={name}
                        userName={profileId}
                        isCurrent={currentFarcasterAccount?.id === id}
                        type={SocialPlatform.Farcaster}
                        logout={() => { }}
                    />
                ))}
            </> : null}
            <div className="flex items-center gap-[16px]">
                <button className="inline-flex h-10 w-[200px] flex-col items-center justify-center">
                    <div className="inline-flex h-10 items-center justify-center gap-2 self-stretch rounded-2xl bg-lightMain px-[18px] py-[11px]">
                        <div className="font-['Helvetica'] text-sm font-bold leading-[18px] text-white">
                            <Trans>Add an existing account</Trans>
                        </div>
                    </div>
                </button>

                <button className="inline-flex h-10 w-[200px] flex-col items-start justify-start" onClick={() => { LogoutModalRef.open({}) }}>
                    <div className="inline-flex h-10 items-center justify-center gap-2 self-stretch rounded-2xl bg-[#FF3545] px-[18px] py-[11px]">
                        <div className="font-['Helvetica'] text-sm font-bold leading-[18px] text-white">
                            <Trans>Log out all</Trans>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}
