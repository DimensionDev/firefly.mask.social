'use client';

import { t } from '@lingui/macro';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { useAccount, useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';

import WalletIcon from '@/assets/wallet.svg';
import { classNames } from '@/helpers/classNames.js';
import { resolve } from '@/helpers/resolve.js';
import { useMounted } from '@/hooks/useMounted.js';
import { AccountModalRef, ConnectWalletModalRef } from '@/modals/controls.js';

interface ConnectWalletProps {
    collapsed?: boolean;
}

export function ConnectWallet({ collapsed = false }: ConnectWalletProps) {
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
            className={classNames('flex gap-x-3 rounded-full p-2 text-xl/5 hover:cursor-pointer hover:bg-bg', {
                'px-4 py-3': !collapsed,
            })}
            onClick={() => {
                account.isConnected ? AccountModalRef.open() : ConnectWalletModalRef.open();
            }}
        >
            <WalletIcon width={20} height={20} />
            <span
                style={{
                    display: collapsed ? 'none' : 'inline',
                }}
            >
                {text}
            </span>
        </div>
    );
}
