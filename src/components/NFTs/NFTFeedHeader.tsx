import type { Address } from 'viem';

import { ActivityCellHeader, type ActivityCellHeaderProps } from '@/components/ActivityCell/ActivityCellHeader.js';
import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { WalletBaseMoreAction } from '@/components/WalletBaseMoreAction.js';

interface NFTFeedHeaderProps extends Omit<ActivityCellHeaderProps, 'icon'> {
    chainId: number;
    contractAddress: Address;
    tokenId: string;
}

export function NFTFeedHeader({ chainId, ...props }: NFTFeedHeaderProps) {
    const { address, contractAddress, tokenId } = props;
    return (
        <ActivityCellHeader {...props} icon={<ChainIcon chainId={chainId} size={15} />}>
            <WalletBaseMoreAction address={address} contractAddress={contractAddress} tokenId={tokenId} />
        </ActivityCellHeader>
    );
}
