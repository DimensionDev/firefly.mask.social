'use client';
import { useAccount, useEnsName } from 'wagmi';
import { useAccountModal, useConnectModal } from '@rainbow-me/rainbowkit';
import { useMemo } from 'react';
import { useMounted } from '@/hooks/useMounted.js';
import { formatEthereumAddress } from '@/maskbook/packages/web3-shared/evm/src/index.js';
import WalletIcon from '@/assets/wallet.svg';

export function ConnectWalletNav() {
    const mounted = useMounted();
    const account = useAccount();
    const { data: ensName } = useEnsName({ address: account.address });

    const { openConnectModal } = useConnectModal();
    const { openAccountModal } = useAccountModal();

    const text = useMemo(() => {
        if (!account.isConnected || !account.address || !mounted) return 'Connect Wallet';
        if (ensName) return ensName;

        return formatEthereumAddress(account.address, 4);
    }, [account.isConnected, ensName, account.address, mounted]);

    return (
        <div
            className="flex gap-x-3 text-2xl/6 hover:cursor-pointer"
            onClick={account.isConnected ? openAccountModal : openConnectModal}
        >
            <WalletIcon width={24} height={24} />
            <span>{text}</span>
        </div>
    );
}
