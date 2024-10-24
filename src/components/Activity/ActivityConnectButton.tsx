'use client';

import { Menu } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';

import AddCircleIcon from '@/assets/add-circle.svg';
import LoadingIcon from '@/assets/loading.svg';
import { ActivityContext } from '@/components/Activity/ActivityContext.js';
import { useActivityClaimCondition } from '@/components/Activity/hooks/useActivityClaimCondition.js';
import { useIsLoginTwitterInActivity } from '@/components/Activity/hooks/useIsLoginTwitterInActivity.js';
import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueWarningMessage } from '@/helpers/enqueueMessage.js';
import { formatAddress } from '@/helpers/formatAddress.js';
import { useFireflyBridgeAuthorization } from '@/hooks/useFireflyBridgeAuthorization.js';
import { AddWalletModalRef } from '@/modals/controls.js';
import { FireflyActivityProvider } from '@/providers/firefly/Activity.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { captureActivityEvent } from '@/providers/telemetry/captureActivityEvent.js';
import { EventId } from '@/providers/types/Telemetry.js';
import { Network, SupportedMethod } from '@/types/bridge.js';
import { ChainId } from '@/types/frame.js';

export function ActivityConnectButton() {
    const { onChangeAddress, address, fireflyAccountId } = useContext(ActivityContext);
    const { refetch: refetchActivityClaimCondition, isRefetching } = useActivityClaimCondition();
    const { data: authToken } = useFireflyBridgeAuthorization();
    const { data: isLoggedIn } = useIsLoginTwitterInActivity();
    const {
        data: { connected = EMPTY_LIST } = {},
        refetch,
        isLoading,
    } = useQuery({
        queryKey: ['my-wallet-connections', authToken],
        async queryFn() {
            return FireflyActivityProvider.getAllConnections({ authToken });
        },
        refetchInterval: 600000,
    });

    const addresses: Array<{ address: string; ens?: string }> = connected
        .filter((x) => x.platform === 'eth')
        .map((x) => ({ address: x.address, ens: x.ens?.[0] }));

    const buttonText = address ? (
        <Trans>Change</Trans>
    ) : (
        <>
            <ChainIcon className="mr-2 h-4 w-4 shrink-0" width={16} height={16} chainId={ChainId.Base} />
            <span>
                <Trans>Connect</Trans>
            </span>
        </>
    );
    const button = (
        <div className="relative inline">
            <Menu>
                <Menu.Button
                    className={
                        address
                            ? 'relative inline-flex items-center rounded-full border border-current bg-transparent px-4 leading-[30px] text-main'
                            : 'relative inline-flex items-center rounded-full bg-main px-4 leading-8 text-primaryBottom'
                    }
                    onClick={(e) => {
                        if (isLoggedIn) return;
                        e.preventDefault();
                        enqueueWarningMessage(<Trans>Please sign in with X to continue</Trans>);
                    }}
                >
                    {isRefetching || isLoading ? (
                        <span className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
                            <LoadingIcon className="animate-spin" width={16} height={16} />
                        </span>
                    ) : null}
                    <span
                        className={classNames('flex items-center', {
                            'opacity-0': isRefetching || isLoading,
                        })}
                    >
                        {buttonText}
                    </span>
                </Menu.Button>
                <Menu.Items className="absolute left-1/2 top-[calc(100%+12px)] z-50 flex max-h-[400px] w-[200px] -translate-x-1/2 flex-col overflow-y-auto rounded-[12px] border border-line bg-primaryBottom shadow-lg">
                    {addresses.map(({ address, ens }) => (
                        <Menu.Item key={address}>
                            <button
                                className="cursor-pointer px-4 py-[11px] text-left text-sm font-semibold leading-6 hover:bg-main/10"
                                onClick={() => {
                                    onChangeAddress(address);
                                    captureActivityEvent(EventId.EVENT_CHANGE_WALLET_SUCCESS, {
                                        wallet_address: address,
                                        firefly_account_id: fireflyAccountId,
                                    });
                                    refetchActivityClaimCondition();
                                }}
                            >
                                {ens || formatAddress(address, 4)}
                            </button>
                        </Menu.Item>
                    ))}
                    <Menu.Item>
                        <button
                            className="flex cursor-pointer items-center justify-start px-4 py-[11px] text-sm font-semibold leading-6 hover:bg-main/10"
                            onClick={async () => {
                                if (fireflyBridgeProvider.supported) {
                                    const address = await fireflyBridgeProvider.request(SupportedMethod.BIND_WALLET, {
                                        type: Network.EVM,
                                    });
                                    onChangeAddress(address);
                                    captureActivityEvent(EventId.EVENT_CONNECT_WALLET_SUCCESS, {
                                        wallet_address: address,
                                        firefly_account_id: fireflyAccountId,
                                    });
                                    await refetchActivityClaimCondition();
                                    await refetch();
                                    return;
                                }
                                const { response } = await AddWalletModalRef.openAndWaitForClose({
                                    connections: connected,
                                    platform: 'evm',
                                });
                                if (response?.address) {
                                    onChangeAddress(response.address);
                                    captureActivityEvent(EventId.EVENT_CONNECT_WALLET_SUCCESS, {
                                        wallet_address: response.address,
                                    });
                                }
                                await refetch();
                            }}
                        >
                            <AddCircleIcon width={24} height={24} className="mr-2" />
                            {fireflyBridgeProvider.supported ? (
                                <Trans>Connect Wallet</Trans>
                            ) : (
                                <Trans>Add Wallet</Trans>
                            )}
                        </button>
                    </Menu.Item>
                </Menu.Items>
            </Menu>
        </div>
    );

    if (address) {
        return (
            <div className="flex w-full items-center gap-2">
                <ChainIcon className="h-5 w-5 shrink-0" chainId={ChainId.Base} />
                <span className="mr-auto text-base font-medium leading-6">
                    {addresses.find((x) => x.address === address)?.ens || formatAddress(address, 4)}
                </span>
                {button}
            </div>
        );
    }
    return button;
}
