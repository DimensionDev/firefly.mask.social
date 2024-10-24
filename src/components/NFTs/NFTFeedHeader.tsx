import { ChainId } from '@masknet/web3-shared-evm';
import type { HTMLProps } from 'react';
import urlcat from 'urlcat';
import type { Address } from 'viem';

import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { NFTMoreAction } from '@/components/NFTs/NFTMoreAction.js';
import { Time } from '@/components/Semantic/Time.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { SourceInURL } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { formatEthereumAddress } from '@/helpers/formatAddress.js';
import { stopPropagation } from '@/helpers/stopEvent.js';
import type { NFTOwnerDisplayInfo } from '@/providers/types/NFTs.js';

interface NFTFeedHeaderProps extends HTMLProps<HTMLDivElement> {
    address: Address;
    contractAddress: Address;
    displayInfo: NFTOwnerDisplayInfo;
    time: number | string | Date;
    tokenId: string;
    chainId: ChainId;
}

export function NFTFeedHeader({
    address,
    contractAddress,
    displayInfo,
    time,
    chainId,
    tokenId,
    className,
    ...rest
}: NFTFeedHeaderProps) {
    const authorUrl = urlcat('/profile/:address', {
        address,
        source: SourceInURL.Wallet,
    });

    return (
        <header className={classNames('flex items-start gap-3', className)} {...rest}>
            <div className="flex flex-1 flex-grow flex-row items-start overflow-hidden text-ellipsis whitespace-nowrap">
                <Link
                    href={authorUrl}
                    onClick={stopPropagation}
                    className="block max-w-full truncate text-medium font-bold leading-5 text-main"
                >
                    {displayInfo.ensHandle ? displayInfo.ensHandle : formatEthereumAddress(address, 4)}
                </Link>
                {displayInfo.ensHandle ? (
                    <Link
                        href={authorUrl}
                        className="ml-2 block max-w-full truncate text-medium leading-5 text-secondary"
                    >
                        <address className="not-italic">{formatEthereumAddress(address, 4)}</address>
                    </Link>
                ) : null}
            </div>

            <div className="ml-auto flex items-center space-x-2">
                <ChainIcon chainId={chainId} size={20} />
                <Time dateTime={time} className="whitespace-nowrap text-xs leading-4 text-secondary md:text-[13px]">
                    <TimestampFormatter time={time} />
                </Time>
                <NFTMoreAction
                    address={address}
                    contractAddress={contractAddress}
                    tokenId={tokenId}
                    chainId={chainId}
                />
            </div>
        </header>
    );
}
