'use client';

import { Trans } from '@lingui/macro';

import LineArrowUp from '@/assets/line-arrow-up.svg';
import LoadingIcon from '@/assets/loading.svg';
import WalletSelectedIcon from '@/assets/wallet.selected.svg';
import WalletIcon from '@/assets/wallet.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Image } from '@/components/Image.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';
import { useConnections } from '@/hooks/useConnections.js';
import { useMounted } from '@/hooks/useMounted.js';
import { ConnectWalletModalRef } from '@/modals/controls.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

interface ConnectWalletProps {
    collapsed?: boolean;
}

export function ConnectWallet({ collapsed: sideBarCollapsed = false }: ConnectWalletProps) {
    const mounted = useMounted();

    const collapsed = useGlobalState.use.collapsedConnectWallet();
    const setCollapsed = useGlobalState.use.updateCollapsedConnectWallet();

    const connections = useConnections();

    if (!mounted) return null;

    const activeConnection = connections.find((connection) => connection.isConnected);
    const text = activeConnection?.label ?? <Trans>Connect Wallet</Trans>;

    const icon =
        !collapsed && connections.some((connection) => connection.isLoading) ? (
            <LoadingIcon className="shrink-0 animate-spin" width={20} height={20} />
        ) : (
            <div className="h-5 w-5 flex-shrink-0">
                {collapsed ? <WalletSelectedIcon width={20} height={20} /> : <WalletIcon width={20} height={20} />}
            </div>
        );

    return (
        <div
            className={classNames('w-full space-y-3 rounded-md px-2 py-2 leading-6 hover:bg-bg md:px-4', {
                'bg-lightBg': collapsed,
            })}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <div
                className={classNames(
                    'relative flex w-full cursor-pointer select-none items-center gap-x-3 overflow-hidden rounded-full text-lg',
                )}
                onClick={() => {
                    if (activeConnection) {
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
                        if (activeConnection?.isConnected) {
                            e.stopPropagation();
                            activeConnection.onOpenAccountModal();
                        }
                    }}
                >
                    {text}
                </span>
                {activeConnection ? (
                    <LineArrowUp
                        className={classNames('absolute right-0 top-1/2 -translate-y-1/2', {
                            'rotate-180': !collapsed,
                        })}
                    />
                ) : null}
            </div>
            {activeConnection && collapsed ? (
                <>
                    {connections
                        .filter((connection) => connection !== activeConnection)
                        .map((connection) => {
                            return (
                                <ClickableButton
                                    key={connection.type}
                                    onClick={() => {
                                        if (connection.isLoading) return;
                                        if (connection.isConnected) {
                                            connection.onOpenAccountModal();
                                            return;
                                        }
                                        connection.onOpenConnectModal();
                                    }}
                                    className="flex w-full flex-row items-center gap-3 text-lg font-bold leading-6"
                                >
                                    {connection.isLoading ? (
                                        <LoadingIcon className="animate-spin" width={20} height={20} />
                                    ) : (
                                        <Image
                                            src={connection.icon ?? ''}
                                            alt="chain-icon"
                                            width={20}
                                            height={20}
                                            className="h-5 w-5"
                                        />
                                    )}
                                    {connection.isConnected ? (
                                        <span>{connection.label}</span>
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
