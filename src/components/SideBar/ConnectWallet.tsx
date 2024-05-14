'use client';

import { t } from '@lingui/macro';
import { formatDomainName, formatEthereumAddress } from '@masknet/web3-shared-evm';
import { useAccount, useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';

import WalletIcon from '@/assets/wallet.svg';
import { Tooltip } from '@/components/Tooltip.js';
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
        if (ensName) return formatDomainName(ensName);

        return formatEthereumAddress(account.address, 4);
    });

    return (
        <div
            className={classNames(
                'flex items-center gap-x-3 overflow-hidden rounded-full text-xl hover:cursor-pointer hover:bg-bg',
                collapsed ? 'p-2' : 'px-4 py-1',
            )}
            onClick={() => {
                account.isConnected ? AccountModalRef.open() : ConnectWalletModalRef.open();
            }}
        >
            {collapsed ? (
                <Tooltip content={account.address || text} placement="right">
                    <WalletIcon className="flex-shrink-0" width={20} height={20} />
                </Tooltip>
            ) : (
                <WalletIcon className="flex-shrink-0" width={20} height={20} />
            )}
            <span
                className="overflow-hidden text-ellipsis py-1"
                style={{ display: collapsed ? 'none' : 'inline' }}
                title={account.address}
            >
                {text}
            </span>
        </div>
    );
}
