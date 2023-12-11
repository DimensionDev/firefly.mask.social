'use client';
import { t } from '@lingui/macro';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { useAccountModal, useConnectModal } from '@rainbow-me/rainbowkit';
import { useMemo } from 'react';
import { useAccount, useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';

import WalletIcon from '@/assets/wallet.svg';
import { useMounted } from '@/hooks/useMounted.js';

export function ConnectWalletNav() {
    const mounted = useMounted();
    const account = useAccount();

    const { data: ensName } = useEnsName({ address: account.address, chainId: mainnet.id });

    const { openConnectModal } = useConnectModal();
    const { openAccountModal } = useAccountModal();

    const text = useMemo(() => {
        if (!account.isConnected || !account.address || !mounted) return t`Connect Wallet`;
        if (ensName) return ensName;

        return formatEthereumAddress(account.address, 4);
    }, [account.isConnected, ensName, account.address, mounted]);

    return (
        <div
            className="flex gap-x-3 px-4 py-3 text-xl/5 hover:cursor-pointer hover:bg-bg hover:font-bold"
            onClick={account.isConnected ? openAccountModal : openConnectModal}
        >
            <WalletIcon width={20} height={20} />
            <span>{text}</span>
        </div>
    );
}
