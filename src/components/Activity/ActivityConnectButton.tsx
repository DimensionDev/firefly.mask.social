'use client';

import { Menu } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';

import AddCircleIcon from '@/assets/add-circle.svg';
import { ActivityContext } from '@/components/Activity/ActivityContext.js';
import { useIsLoginTwitterInActivity } from '@/components/Activity/hooks/useIsLoginTwitterInActivity.js';
import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { formatAddress } from '@/helpers/formatAddress.js';
import { useAllConnections } from '@/hooks/useAllConnections.js';
import { AddWalletModalRef } from '@/modals/controls.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { Network, SupportedMethod } from '@/types/bridge.js';
import { ChainId } from '@/types/frame.js';

export function ActivityConnectButton() {
    const { onChangeAddress, address } = useContext(ActivityContext);
    const { data: isLoggedIn } = useIsLoginTwitterInActivity();
    const { data: { connected = EMPTY_LIST } = {}, refetch } = useAllConnections({
        refetchInterval: 600000,
    });
    const { data: bridgeAddresses = EMPTY_LIST } = useQuery({
        enabled: fireflyBridgeProvider.supported,
        queryKey: ['firefly-bridge-address', Network.EVM],
        async queryFn() {
            return await fireflyBridgeProvider.request(SupportedMethod.GET_WALLET_ADDRESS, {
                type: Network.EVM,
            });
        },
        refetchInterval: 600000,
    });
    const addresses = fireflyBridgeProvider.supported
        ? bridgeAddresses
        : connected.filter((x) => x.platform === 'eth').map((x) => x.address);

    const buttonText = address ? (
        <Trans>Change</Trans>
    ) : (
        <>
            <ChainIcon className="mr-2 h-4 w-4 shrink-0" chainId={ChainId.Base} />
            <Trans>Connect</Trans>
        </>
    );
    const buttonClassName = address
        ? 'inline-flex items-center rounded-full text-main px-4 bg-transparent border border-current leading-[30px]'
        : 'inline-flex items-center rounded-full bg-main px-4 leading-8 text-primaryBottom';
    const button = (
        <div className="relative inline">
            <Menu>
                <Menu.Button
                    className={buttonClassName}
                    onClick={(e) => {
                        if (isLoggedIn) return;
                        e.preventDefault();
                        enqueueErrorMessage(<Trans>Please sign in with X to continue</Trans>);
                    }}
                >
                    {buttonText}
                </Menu.Button>
                <Menu.Items className="absolute left-1/2 top-[calc(100%+12px)] z-50 flex w-[200px] -translate-x-1/2 flex-col rounded-[12px] border border-line bg-primaryBottom shadow-lg">
                    {addresses.map((address) => (
                        <Menu.Item key={address}>
                            <a
                                className="cursor-pointer px-4 py-[11px] text-sm font-semibold leading-6"
                                onClick={() => {
                                    onChangeAddress(address);
                                }}
                            >
                                {formatAddress(address, 4)}
                            </a>
                        </Menu.Item>
                    ))}
                    <Menu.Item>
                        <a
                            className="flex cursor-pointer items-center px-4 py-[11px] text-sm font-semibold leading-6"
                            onClick={async () => {
                                if (fireflyBridgeProvider.supported) {
                                    const address = await fireflyBridgeProvider.request(
                                        SupportedMethod.CONNECT_WALLET,
                                        {
                                            type: Network.EVM,
                                        },
                                    );
                                    onChangeAddress(address);
                                    return;
                                }
                                await AddWalletModalRef.openAndWaitForClose({
                                    connections: connected,
                                });
                                await refetch();
                            }}
                        >
                            <AddCircleIcon width={24} height={24} className="mr-2" />
                            {fireflyBridgeProvider.supported ? (
                                <Trans>Connect Wallet</Trans>
                            ) : (
                                <Trans>Add Wallet</Trans>
                            )}
                        </a>
                    </Menu.Item>
                </Menu.Items>
            </Menu>
        </div>
    );

    if (address) {
        return (
            <div className="flex w-full items-center gap-2">
                <ChainIcon className="h-5 w-5 shrink-0" chainId={ChainId.Base} />
                <span className="mr-auto text-base font-medium leading-6">{formatAddress(address, 4)}</span>
                {button}
            </div>
        );
    }
    return button;
}
