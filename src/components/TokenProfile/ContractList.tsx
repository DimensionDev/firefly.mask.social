import { Menu } from '@headlessui/react';
import { t } from '@lingui/macro';
import { type HTMLProps, memo } from 'react';

import DotsIcon from '@/assets/dots.svg';
import QuestionIcon from '@/assets/question.svg';
import { CopyButton } from '@/components/CopyButton.js';
import { Image } from '@/components/Image.js';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';
import { useChainInfo } from '@/components/TokenProfile/useChainInfo.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';
import { formatEthereumAddress } from '@/helpers/formatEthereumAddress.js';
import type { Contract, Trending } from '@/providers/types/Trending.js';

interface Props {
    contracts: NonNullable<Trending['contracts']>;
}
export const ContractList = memo<Props>(function ContractList({ contracts }) {
    return (
        <MoreActionMenu
            loginRequired={false}
            button={
                <Tooltip content={t`More`} placement="top">
                    <DotsIcon className="text-secondary" width={16} height={16} />
                </Tooltip>
            }
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
        </MoreActionMenu>
    );
});

interface ContractItemProps extends HTMLProps<HTMLDivElement> {
    contract: Contract;
}
function ContractItem({ contract, ...rest }: ContractItemProps) {
    const chain = useChainInfo(contract.runtime, contract.chainId);

    const name = chain?.name || contract.runtime;
    return (
        <div {...rest} className={classNames('flex items-center gap-2', rest.className)}>
            {chain?.icon ? (
                <Image src={chain.icon} className="flex-shrink-0" alt={name} width={16} height={16} />
            ) : (
                <QuestionIcon className="ml-1 cursor-pointer text-second" width={16} height={16} />
            )}
            <div className="min-w-[100px] flex-grow p-1 leading-4">
                <div className="text-[12px] font-bold capitalize text-main">{name}</div>
                <div className="max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-bold text-main">
                    {formatEthereumAddress(contract.address, 4)}
                </div>
            </div>
            <CopyButton value={contract.address} />
        </div>
    );
}
