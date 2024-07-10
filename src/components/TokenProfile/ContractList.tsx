import { Menu, Transition } from '@headlessui/react';
import { t } from '@lingui/macro';
import { useNetworkDescriptor } from '@masknet/web3-hooks-base';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { motion } from 'framer-motion';
import { Fragment, type HTMLProps, memo } from 'react';

import DotsIcon from '@/assets/dots.svg';
import { CopyButton } from '@/components/CopyButton.js';
import { Image } from '@/components/Image.js';
import { Tooltip } from '@/components/Tooltip.js';
import { NetworkPluginID } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import type { Contract, Trending } from '@/providers/types/Trending.js';

interface Props {
    contracts: Trending['contracts'];
}
export const ContractList = memo<Props>(function ContractList({ contracts }) {
    if (!contracts?.length) return null;
    return (
        <Menu as="div" className="relative">
            <Menu.Button
                whileTap={{ scale: 0.9 }}
                as={motion.button}
                className="flex items-center text-secondary"
                aria-label="More"
            >
                <Tooltip content={t`More`} placement="top">
                    <DotsIcon className="text-secondary" width={16} height={16} />
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
                    className="backdrop-filter-[blur(8px)] absolute right-0 z-[1000] flex max-h-[225px] w-max flex-col gap-2 overflow-auto rounded-2xl border border-line bg-primaryBottom p-3 text-base text-main shadow-[0_0_20px_0_rgba(34,49,71,0.05)]"
                    data-hide-scrollbar
                    onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                    }}
                >
                    {contracts.map((contract, index) => (
                        <Menu.Item key={contract.address}>
                            {({ close }) => (
                                <ContractItem
                                    className={index < contracts.length - 1 ? 'border-b border-line' : ''}
                                    contract={contract}
                                    onClick={close}
                                />
                            )}
                        </Menu.Item>
                    ))}
                </Menu.Items>
            </Transition>
        </Menu>
    );
});

interface ContractItemProps extends HTMLProps<HTMLDivElement> {
    contract: Contract;
}
function ContractItem({ contract, ...rest }: ContractItemProps) {
    const chain = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, contract.chainId);

    if (!chain) return null;

    return (
        <div {...rest} className={classNames('flex items-center gap-2', rest.className)}>
            <Image src={chain.icon} className="flex-shrink-0" alt={chain.name} width={16} height={16} />
            <div className="min-w-[100px] flex-grow p-1 leading-4">
                <div className="text-[12px] font-bold text-main">{chain.name}</div>
                <div className="max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-bold text-main">
                    {formatEthereumAddress(contract.address, 4)}
                </div>
            </div>
            <CopyButton value={contract.address} />
        </div>
    );
}
