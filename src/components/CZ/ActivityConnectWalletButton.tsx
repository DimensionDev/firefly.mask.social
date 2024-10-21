import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';

import AddCircleIcon from '@/assets/add-circle.svg';
import { ActivityContext } from '@/components/CZ/ActivityContext.js';
import { formatAddress } from '@/helpers/formatAddress.js';
import { ConnectModalRef } from '@/modals/controls.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { Network, SupportedMethod } from '@/types/bridge.js';

export function ActivityConnectWalletButton() {
    const { data: addresses = [] } = useQuery({
        queryKey: ['mobile-address'],
        async queryFn() {
            if (!fireflyBridgeProvider.supported) return [];
            return await fireflyBridgeProvider.request(SupportedMethod.GET_WALLET_ADDRESS, {
                type: Network.EVM,
            });
        },
    });
    const { setAddress } = useContext(ActivityContext);

    if (!fireflyBridgeProvider.supported) {
        return (
            <button
                className="h-10 rounded-full bg-white px-[18px] text-sm font-bold leading-10 text-[#181a20]"
                onClick={() => ConnectModalRef.open()}
            >
                <Trans>Connect Wallet</Trans>
            </button>
        );
    }

    return (
        <div className="relative">
            <Menu>
                <MenuButton className="h-10 rounded-full bg-white px-[18px] text-sm font-bold leading-10 text-[#181a20]">
                    <Trans>Connect Wallet</Trans>
                </MenuButton>

                <MenuItems className="absolute left-1/2 top-[calc(100%+12px)] flex w-[200px] -translate-x-1/2 flex-col rounded-[12px] bg-[#1C1C1E] shadow-lg">
                    {addresses.map((address) => (
                        <MenuItem key={address}>
                            <a
                                className="px-4 py-[11px] text-sm font-semibold leading-6"
                                onClick={() => {
                                    setAddress(address);
                                }}
                            >
                                {formatAddress(address, 4)}
                            </a>
                        </MenuItem>
                    ))}
                    <MenuItem>
                        <a
                            className="flex items-center px-4 py-[11px] text-sm font-semibold leading-6"
                            onClick={async () => {
                                const address = await fireflyBridgeProvider.request(SupportedMethod.CONNECT_WALLET, {
                                    type: Network.EVM,
                                });
                                setAddress(address);
                            }}
                        >
                            <AddCircleIcon width={24} height={24} className="mr-2" />
                            <Trans>Connect Wallet</Trans>
                        </a>
                    </MenuItem>
                </MenuItems>
            </Menu>
        </div>
    );
}

export function ActivityChangeWalletButton() {
    const { data: addresses = [] } = useQuery({
        queryKey: ['mobile-address'],
        async queryFn() {
            if (!fireflyBridgeProvider.supported) return [];
            return await fireflyBridgeProvider.request(SupportedMethod.GET_WALLET_ADDRESS, {
                type: Network.EVM,
            });
        },
    });
    const { setAddress } = useContext(ActivityContext);

    return (
        <div className="relative">
            <Menu>
                <MenuButton className="text-[13px] font-bold leading-[18px] text-[#f4d008]">
                    <Trans>Change Wallet</Trans>
                </MenuButton>

                <MenuItems className="absolute left-1/2 top-[calc(100%+12px)] flex w-[200px] -translate-x-1/2 flex-col rounded-[12px] bg-[#1C1C1E] shadow-lg">
                    {addresses.map((address) => (
                        <MenuItem key={address}>
                            <a
                                className="px-4 py-[11px] text-sm font-semibold leading-6"
                                onClick={() => {
                                    setAddress(address);
                                }}
                            >
                                {formatAddress(address, 4)}
                            </a>
                        </MenuItem>
                    ))}
                    <MenuItem>
                        <a
                            className="flex items-center px-4 py-[11px] text-sm font-semibold leading-6"
                            onClick={async () => {
                                const address = await fireflyBridgeProvider.request(SupportedMethod.CONNECT_WALLET, {
                                    type: Network.EVM,
                                });
                                setAddress(address);
                            }}
                        >
                            <AddCircleIcon width={24} height={24} className="mr-2" />
                            <Trans>Connect Wallet</Trans>
                        </a>
                    </MenuItem>
                </MenuItems>
            </Menu>
        </div>
    );
}
