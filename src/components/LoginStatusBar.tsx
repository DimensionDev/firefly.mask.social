"use client"

import { useMemo } from 'react';
import { Image } from '@/esm/Image.js';
import { FarcasterStatusModalRef, LensStatusModalRef } from '@/modals/controls.js';
import { useLensAccountsStore, useFarcasterAccountsStore } from '@/store/useAccountPersistStore.js';

export function LoginStatusBar() {
    const lensAccounts = useLensAccountsStore.use.currentAccounts();
    const farcasterAccounts = useFarcasterAccountsStore.use.currentAccounts();
    const lensAccount = useMemo(() => lensAccounts.find((account) => account.isCurrent), [lensAccounts]);
    const farcasterAccount = useMemo(() => farcasterAccounts.length ? farcasterAccounts[0] : undefined, [farcasterAccounts]);
    return (
        <div className="flex gap-x-2 pl-2">
            {lensAccount ? <button className="relative h-[40px] w-[48px]" onClick={() => LensStatusModalRef.open()}>
                <div className="absolute left-0 top-0 h-[40px] w-[40px] rounded-[99px] shadow backdrop-blur-lg">
                    <Image src={lensAccount.avatar} alt="avatar" width={40} height={40} className='rounded-[99px]' />
                </div>
                <Image
                    className="absolute left-[32px] top-[24px] h-[16px] w-[16px] rounded-[99px] border border-white shadow"
                    src={'/svg/lens.svg'}
                    alt="logo"
                    width={16}
                    height={16}
                />
            </button> : null}
            {farcasterAccount ? <button className="relative h-[40px] w-[48px]" onClick={() => FarcasterStatusModalRef.open()}>
                <div className="absolute left-0 top-0 h-[40px] w-[40px] rounded-[99px] shadow backdrop-blur-lg">
                    <Image src={farcasterAccount.avatar} alt="avatar" width={40} height={40} className='rounded-[99px]' />
                </div>
                <Image
                    className="absolute left-[32px] top-[24px] h-[16px] w-[16px] rounded-[99px] border border-white shadow"
                    src={'/svg/farcaster.svg'}
                    alt="logo"
                    width={16}
                    height={16}
                />
            </button> : <button className="relative h-[40px] w-[48px]" onClick={() => FarcasterStatusModalRef.open()}>
                <div className="absolute left-0 top-0 h-[40px] w-[40px] rounded-[99px] shadow backdrop-blur-lg">
                    <Image src="/svg/farcaster.svg" alt="farcaster" width={40} height={40} />
                </div>
                <Image
                    className="absolute left-[32px] top-[24px] h-[17px] w-[17px] rounded-[99px] shadow"
                    src={'/svg/plus.svg'}
                    alt="logo"
                    width={16}
                    height={16}
                />
            </button>}
            {lensAccounts ? null : <button className="relative h-[40px] w-[48px]" onClick={() => FarcasterStatusModalRef.open()}>
                <div className="absolute left-0 top-0 h-[40px] w-[40px] rounded-[99px] shadow backdrop-blur-lg">
                    <Image src="/svg/lens.svg" alt="lens" width={40} height={40} />
                </div>
                <Image
                    className="absolute left-[32px] top-[24px] h-[17px] w-[17px] rounded-[99px] shadow"
                    src={'/svg/plus.svg'}
                    alt="logo"
                    width={16}
                    height={16}
                />
            </button>}
        </div>
    );
}
