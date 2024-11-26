'use client';

import { Trans } from '@lingui/macro';
import { ChainId as EVMChainId } from '@masknet/web3-shared-evm';
import { ChainId as SolanaChainId } from '@masknet/web3-shared-solana';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { useWalletModal as useConnectModalSolana } from '@solana/wallet-adapter-react-ui';
import { useAccount as useEVMAccount, useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';

import LineArrowUp from '@/assets/line-arrow-up.svg';
import LoadingIcon from '@/assets/loading.svg';
import WalletSelectedIcon from '@/assets/wallet.selected.svg';
import WalletIcon from '@/assets/wallet.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Image } from '@/components/Image.js';
import { Tooltip } from '@/components/Tooltip.js';
import { NetworkPluginID } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { formatEthereumAddress, formatSolanaAddress } from '@/helpers/formatAddress.js';
import { formatDomainName } from '@/helpers/formatDomainName.js';
import { getNetworkDescriptor } from '@/helpers/getNetworkDescriptor.js';
import { resolveValue } from '@/helpers/resolveValue.js';
import { useMounted } from '@/hooks/useMounted.js';
import { AccountModalRef, ConnectModalRef, ConnectWalletModalRef, SolanaAccountModalRef } from '@/modals/controls.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

interface ConnectWalletProps {
    collapsed?: boolean;
}

export function ConnectWallet({ collapsed: sideBarCollapsed = false }: ConnectWalletProps) {
    const mounted = useMounted();

    const evmNetworkDescriptor = getNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, EVMChainId.Mainnet);
    const solanaNetworkDescriptor = getNetworkDescriptor(NetworkPluginID.PLUGIN_SOLANA, SolanaChainId.Mainnet);

    const connectModalSolana = useConnectModalSolana();

    const evmAccount = useEVMAccount();
    const solanaWallet = useSolanaWallet();

    const { data: ensName } = useEnsName({ address: evmAccount.address, chainId: mainnet.id });

    const collapsed = useGlobalState.use.collapsedConnectWallet();
    const setCollapsed = useGlobalState.use.updateCollapsedConnectWallet();

    console.log('DEBUG: accounts');
    console.log({
        evmAccount,
        solanaWallet,
        ensName,
        collapsed,
    });

    const chainTypes = [
        {
            icon: evmNetworkDescriptor?.icon,
            label: resolveValue(() => {
                if (!evmAccount.isConnected || !evmAccount.address || !mounted) return null;
                if (ensName) return formatDomainName(ensName);
                return formatEthereumAddress(evmAccount.address, 4);
            }),
            onOpenConnectModal: () => ConnectModalRef.open(),
            onOpenAccountModal: () => AccountModalRef.open(),
            isConnected: evmAccount.isConnected,
            isLoading: evmAccount.isConnecting || evmAccount.isReconnecting,
            type: 'EVM',
        },
        {
            icon: solanaNetworkDescriptor?.icon,
            label: resolveValue(() => {
                if (!solanaWallet.publicKey) return null;
                const address = solanaWallet.publicKey.toBase58();
                return formatSolanaAddress(address, 4);
            }),
            onOpenConnectModal: () => connectModalSolana.setVisible(true),
            onOpenAccountModal: () => SolanaAccountModalRef.open(),
            isConnected: solanaWallet.connected,
            isLoading: solanaWallet.connecting || solanaWallet.disconnecting,
            type: 'Solana',
        },
    ];

    const activeType = chainTypes.find((type) => type.isConnected);
    const text = activeType?.label ?? <Trans>Connect Wallet</Trans>;
    const isConnected = !!activeType;

    if (!mounted) return null;

    const icon = (
        <div className="h-5 w-5 flex-shrink-0">
            {collapsed ? <WalletSelectedIcon width={20} height={20} /> : <WalletIcon width={20} height={20} />}
        </div>
    );

    return (
        <div
            className={classNames('w-full space-y-3 rounded-md px-2 py-2.5 leading-6 hover:bg-bg md:px-4 md:py-3', {
                'bg-lightBg': collapsed,
            })}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <div
                className={classNames(
                    'relative flex w-full cursor-pointer select-none items-center gap-x-3 overflow-hidden rounded-full text-xl',
                )}
                onClick={() => {
                    if (isConnected) {
                        setCollapsed(!collapsed);
                        return;
                    }
                    ConnectWalletModalRef.open();
                }}
            >
                {sideBarCollapsed ? (
                    <Tooltip content={text} placement="right">
                        {icon}
                    </Tooltip>
                ) : (
                    icon
                )}
                <span
                    className={classNames(
                        'overflow-hidden text-ellipsis leading-6',
                        {
                            'font-bold': collapsed,
                        },
                        sideBarCollapsed ? 'hidden' : 'inline',
                    )}
                    onClick={(e) => {
                        if (activeType?.isConnected) {
                            e.stopPropagation();
                            activeType.onOpenAccountModal();
                        }
                    }}
                >
                    {text}
                </span>
                {isConnected ? (
                    <LineArrowUp
                        className={classNames('absolute right-0 top-1/2 -translate-y-1/2', {
                            'rotate-180': !collapsed,
                        })}
                    />
                ) : null}
            </div>
            {isConnected && collapsed ? (
                <>
                    {chainTypes
                        .filter((type) => type !== activeType)
                        .map((type) => {
                            return (
                                <ClickableButton
                                    key={type.type}
                                    onClick={() => {
                                        if (type.isLoading) return;
                                        if (type.isConnected) {
                                            type.onOpenAccountModal();
                                            return;
                                        }
                                        type.onOpenConnectModal();
                                    }}
                                    className="flex w-full flex-row items-center gap-3 text-xl font-bold leading-6"
                                >
                                    {type.isLoading ? (
                                        <LoadingIcon className="animate-spin" width={20} height={20} />
                                    ) : (
                                        <Image
                                            src={type.icon ?? ''}
                                            alt="chain-icon"
                                            width={20}
                                            height={20}
                                            className="h-5 w-5"
                                        />
                                    )}
                                    {type.isConnected ? (
                                        <span>{type.label}</span>
                                    ) : (
                                        <span>
                                            <Trans>Connect Wallet</Trans>
                                        </span>
                                    )}
                                </ClickableButton>
                            );
                        })}
                </>
            ) : null}
        </div>
    );
}
