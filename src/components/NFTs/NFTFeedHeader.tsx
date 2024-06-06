import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm';
import urlcat from 'urlcat';

import { Avatar } from '@/components/Avatar.js';
import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { NFTMoreAction } from '@/components/NFTs/NFTMoreAction.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { SourceInURL } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import type { NFTOwnerDisplayInfo } from '@/providers/types/NFTs.js';

interface NFTFeedHeaderProps {
    address: string;
    displayInfo: NFTOwnerDisplayInfo;
    time: number | string | Date;
    chainId: ChainId;
    className?: string;
}

export function NFTFeedHeader({ address, displayInfo, time, chainId, className }: NFTFeedHeaderProps) {
    const authorUrl = urlcat('/profile/:address', {
        address,
        source: SourceInURL.Wallet,
    });

    return (
        <div className={classNames('mb-1.5 flex items-start gap-3', className)}>
            <Link href={authorUrl} className="z-[1]" onClick={(event) => event.stopPropagation()}>
                <Avatar className="h-10 w-10" src={displayInfo.avatarUrl} size={40} alt={address} />
            </Link>

            <div className="flex max-w-[calc(100%-40px-88px-24px)] flex-1 flex-col items-start overflow-hidden">
                <Link
                    href={authorUrl}
                    onClick={(event) => event.stopPropagation()}
                    className="block w-full truncate text-[15px] font-bold leading-5 text-main"
                >
                    {displayInfo.ensHandle ? displayInfo.ensHandle : formatEthereumAddress(address, 4)}
                </Link>
                <Link href={authorUrl} className="block w-full truncate text-[15px] leading-5 text-secondary">
                    {formatEthereumAddress(address, 4)}
                </Link>
            </div>

            <div className="ml-auto flex items-center space-x-2">
                <ChainIcon chainId={chainId} size={20} />
                <span className="whitespace-nowrap text-xs leading-4 text-secondary md:text-[13px]">
                    <TimestampFormatter time={time} />
                </span>
                <NFTMoreAction contractAddress={address} />
            </div>
        </div>
    );
}
