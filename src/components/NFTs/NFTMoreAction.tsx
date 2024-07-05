import { Menu, Transition } from '@headlessui/react';
import { t } from '@lingui/macro';
import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation.js';
import { Fragment } from 'react';
import type { Address } from 'viem';
import { useEnsName } from 'wagmi';

import MoreIcon from '@/assets/more.svg';
import { MuteWalletButton } from '@/components/Actions/MuteWalletButton.js';
import { NFTReportSpamButton } from '@/components/Actions/NFTReportSpamButton.js';
import { WatchWalletButton } from '@/components/Actions/WatchWalletButton.js';
import { Tooltip } from '@/components/Tooltip.js';
import { PageRoute } from '@/constants/enum.js';
import { useIsWalletMuted } from '@/hooks/useIsWalletMuted.js';
import { useNFTDetail } from '@/hooks/useNFTDetail.js';

interface Props {
    /** User address */
    address: Address;
    contractAddress: Address;
    tokenId: string;
    chainId: ChainId;
}
export function NFTMoreAction({ address, contractAddress, tokenId, chainId }: Props) {
    const { data: ens } = useEnsName({ address });
    const identity = ens || formatEthereumAddress(address, 4);
    const { data } = useNFTDetail(contractAddress, tokenId, chainId);
    const collectionId = data?.collection?.id;
    const { data: isMuted } = useIsWalletMuted(address);
    const pathname = usePathname();
    const isMyProfile = pathname === PageRoute.Profile; // My wallet profile page has no path param
    return (
        <Menu
            className="relative"
            as="div"
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <Menu.Button
                whileTap={{ scale: 0.9 }}
                as={motion.button}
                className="flex items-center text-secondary"
                aria-label="More"
                onClick={async (event) => {
                    event.stopPropagation();
                }}
            >
                <Tooltip content={t`More`} placement="top">
                    <MoreIcon width={24} height={24} />
                </Tooltip>
            </Menu.Button>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items
                    className="absolute right-0 z-[1000] flex w-max flex-col gap-2 overflow-hidden rounded-2xl border border-line bg-primaryBottom py-3 text-base text-main"
                    onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                    }}
                >
                    {!isMyProfile ? (
                        <>
                            <Menu.Item>
                                {({ close }) => (
                                    <WatchWalletButton identity={identity} address={address} onClick={close} />
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ close }) => (
                                    <MuteWalletButton
                                        identity={identity}
                                        address={address}
                                        isMuted={isMuted}
                                        onClick={close}
                                    />
                                )}
                            </Menu.Item>
                        </>
                    ) : null}
                    {collectionId ? (
                        <Menu.Item>
                            {({ close }) => <NFTReportSpamButton onClick={close} collectionId={collectionId} />}
                        </Menu.Item>
                    ) : null}
                </Menu.Items>
            </Transition>
        </Menu>
    );
}
