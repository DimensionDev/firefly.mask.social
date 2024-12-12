import { ChainId } from '@masknet/web3-shared-evm';
import type { HTMLProps } from 'react';
import type { Address } from 'viem';

import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { Time } from '@/components/Semantic/Time.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { WalletBaseMoreAction } from '@/components/WalletBaseMoreAction.js';
import { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { formatEthereumAddress } from '@/helpers/formatAddress.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
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
    const authorUrl = resolveProfileUrl(Source.Wallet, address);

    return (
        <header className={classNames('flex items-start gap-3', className)} {...rest}>
            <div className="flex flex-1 flex-grow flex-row items-center overflow-hidden text-ellipsis whitespace-nowrap text-[15px] leading-6">
                <Link
                    href={authorUrl}
                    onClick={stopPropagation}
                    className="block max-w-full truncate font-bold text-main"
                >
                    {displayInfo.ensHandle ? displayInfo.ensHandle : formatEthereumAddress(address, 4)}
                </Link>
                {displayInfo.ensHandle ? (
                    <Link href={authorUrl} className="ml-2 block max-w-full shrink-0 truncate text-secondary">
                        <address className="not-italic">{formatEthereumAddress(address, 4)}</address>
                    </Link>
                ) : null}
                <Time dateTime={time} className="mx-1 whitespace-nowrap text-secondary">
                    · <TimestampFormatter time={time} /> ·
                </Time>
                <ChainIcon chainId={chainId} size={15} />
            </div>

            <div className="ml-auto flex items-center space-x-2">
                <WalletBaseMoreAction
                    address={address}
                    contractAddress={contractAddress}
                    tokenId={tokenId}
                    chainId={chainId}
                />
            </div>
        </header>
    );
}
