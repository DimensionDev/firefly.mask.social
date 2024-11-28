'use client';

import { Menu } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { type MouseEvent, useContext } from 'react';

import AddCircleIcon from '@/assets/add-circle.svg';
import LoadingIcon from '@/assets/loading.svg';
import { ActivityContext } from '@/components/Activity/ActivityContext.js';
import { useActivityBindAddress } from '@/components/Activity/hooks/useActivityBindAddress.js';
import { useActivityClaimCondition } from '@/components/Activity/hooks/useActivityClaimCondition.js';
import { useActivityConnections } from '@/components/Activity/hooks/useActivityConnections.js';
import { useIsLoginInActivity } from '@/components/Activity/hooks/useIsLoginInActivity.js';
import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { type SocialSource } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueWarningMessage } from '@/helpers/enqueueMessage.js';
import { formatAddress } from '@/helpers/formatAddress.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { captureActivityEvent } from '@/providers/telemetry/captureActivityEvent.js';
import { EventId } from '@/providers/types/Telemetry.js';
import { ChainId } from '@/types/frame.js';

export function ActivityConnectButton({ source }: { source: SocialSource }) {
    const { onChangeAddress, address } = useContext(ActivityContext);
    const { refetch: refetchActivityClaimCondition, isRefetching } = useActivityClaimCondition(source);
    const isLoggedIn = useIsLoginInActivity(source);
    const { data: { connected = EMPTY_LIST } = {}, isLoading, refetch } = useActivityConnections();
    const [, bindAddress] = useActivityBindAddress(source);

    const addresses: Array<{ address: string; ens?: string }> = connected
        .filter((x) => x.platform === 'eth')
        .map((x) => ({ address: x.address, ens: x.ens?.[0] }));

    const buttonText = address ? (
        <Trans>Change</Trans>
    ) : (
        <>
            <ChainIcon className="mr-2 shrink-0" size={18} chainId={ChainId.Base} />
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
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                        if (isLoggedIn) {
                            refetch();
                            return;
                        }
                        e.preventDefault();
                        enqueueWarningMessage(
                            <Trans>Please sign in with {resolveSourceName(source)} to continue</Trans>,
                        );
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
                <Menu.Items
                    className={classNames(
                        'absolute bottom-[calc(100%+12px)] z-50 flex max-h-[200px] w-[200px] flex-col overflow-y-auto rounded-[12px] border border-line bg-primaryBottom shadow-lg',
                        address ? 'right-0' : 'left-0 sm:left-[unset] sm:right-0',
                    )}
                >
                    {addresses.map(({ address, ens }) => (
                        <Menu.Item key={address}>
                            <button
                                className="cursor-pointer px-4 py-2 text-left text-sm font-semibold leading-6 hover:bg-main/10"
                                onClick={() => {
                                    onChangeAddress(address);
                                    captureActivityEvent(EventId.EVENT_CHANGE_WALLET_SUCCESS, {
                                        wallet_address: address,
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
                            className="flex cursor-pointer items-center justify-start px-4 py-2 text-sm font-semibold leading-6 hover:bg-main/10"
                            onClick={bindAddress}
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
                <ChainIcon className="shrink-0" size={18} chainId={ChainId.Base} />
                <span className="mr-auto text-base font-medium leading-6">
                    {addresses.find((x) => x.address === address)?.ens || formatAddress(address, 4)}
                </span>
                {button}
            </div>
        );
    }
    return button;
}
