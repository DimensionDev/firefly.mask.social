'use client';
import { t } from '@lingui/macro';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { useMemo } from 'react';
import { useAccount, useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';

import WalletIcon from '@/assets/wallet.svg';
import { useMounted } from '@/hooks/useMounted.js';
import { AccountModalRef, ConnectWalletModalRef } from '@/modals/controls.js';

export function ConnectWalletNav() {
    const mounted = useMounted();
    const account = useAccount();

    const { data: ensName } = useEnsName({ address: account.address, chainId: mainnet.id });

    const text = useMemo(() => {
        if (!account.isConnected || !account.address || !mounted) return t`Connect Wallet`;
        if (ensName) return ensName;

        return formatEthereumAddress(account.address, 4);
    }, [account.isConnected, ensName, account.address, mounted]);

    return (
        <div
            className="flex gap-x-3 px-4 py-3 text-2xl/6 hover:cursor-pointer"
            onClick={() => {
                account.isConnected ? AccountModalRef.open() : ConnectWalletModalRef.open();
            }}
        >
            <WalletIcon width={24} height={24} />
            <span>{text}</span>
        </div>
    );
}
