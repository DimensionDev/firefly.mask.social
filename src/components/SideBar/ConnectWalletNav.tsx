'use client';

import { t } from '@lingui/macro';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { useAccount, useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';

import WalletIcon from '@/assets/wallet.svg';
import { resolve } from '@/helpers/resolve.js';
import { useMounted } from '@/hooks/useMounted.js';
import { AccountModalRef, ConnectWalletModalRef } from '@/modals/controls.js';

export function ConnectWalletNav() {
    const mounted = useMounted();
    const account = useAccount();

    const { data: ensName } = useEnsName({ address: account.address, chainId: mainnet.id });

    const text = resolve(() => {
        if (!account.isConnected || !account.address || !mounted) return t`Connect Wallet`;
        if (ensName) return ensName;

        return formatEthereumAddress(account.address, 4);
    });

    return (
        <div
            className="flex gap-x-3 text-xl/5 hover:cursor-pointer hover:bg-bg md:rounded-full md:p-2 lg:px-4 lg:py-3"
            onClick={() => {
                account.isConnected ? AccountModalRef.open() : ConnectWalletModalRef.open();
            }}
        >
            <WalletIcon width={20} height={20} />
            <span className="hidden lg:inline">{text}</span>
        </div>
    );
}
