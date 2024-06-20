import { ChainId } from '@masknet/web3-shared-evm';
import { motion } from 'framer-motion';
import { isUndefined } from 'lodash-es';
import { useRouter } from 'next/navigation.js';
import { memo, useMemo, useState } from 'react';
import type { Address } from 'viem';

import { FeedFollowSource } from '@/components/FeedFollowSource.js';
import { NFTFeedBody, type NFTFeedBodyProps } from '@/components/NFTs/NFTFeedBody.js';
import { NFTFeedHeader } from '@/components/NFTs/NFTFeedHeader.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';
import { type FollowingNFT, type NFTOwnerDisplayInfo } from '@/providers/types/NFTs.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export interface SingleNFTFeedProps {
    ownerAddress: Address;
    contractAddress: Address;
    disableAnimate?: boolean;
    listKey?: string;
    index?: number;
    tokenList: NFTFeedBodyProps['tokenList'];
    chainId: ChainId;
    displayInfo: NFTOwnerDisplayInfo;
    time: number | string | Date;
    followingSources?: FollowingNFT['followingSources'];
}

export const SingleNFTFeed = memo(function SingleNFTFeed({
    ownerAddress,
    contractAddress,
    tokenList,
    chainId,
    displayInfo,
    disableAnimate,
    listKey,
    index,
    time,
    followingSources,
}: SingleNFTFeedProps) {
    const setScrollIndex = useGlobalState.use.setScrollIndex();
    const router = useRouter();
    const [activeTokenIndex, setActiveTokenIndex] = useState(0);
    const token = tokenList[activeTokenIndex];
    const nftUrl = useMemo(() => {
        if (!token) return null;
        return resolveNftUrl(token.contractAddress, {
            chainId,
            tokenId: token.id,
        });
    }, [chainId, token]);

    return (
        <motion.article
            initial={!disableAnimate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cursor-pointer border-b border-line bg-bottom px-3 py-2 hover:bg-bg max-md:px-4 max-md:py-3 md:px-4 md:py-3"
            onClick={() => {
                const selection = window.getSelection();
                if (selection && selection.toString().length !== 0) return;
                if (listKey && !isUndefined(index)) setScrollIndex(listKey, index);
                if (nftUrl) router.push(nftUrl);
            }}
            onMouseEnter={() => {
                if (nftUrl) router.prefetch(nftUrl);
            }}
        >
            {followingSources?.[0] ? <FeedFollowSource source={followingSources[0]} /> : null}
            <NFTFeedHeader
                address={ownerAddress}
                contractAddress={contractAddress}
                tokenId={token.id}
                chainId={chainId}
                displayInfo={displayInfo}
                time={time}
            />
            <NFTFeedBody
                index={activeTokenIndex}
                onChangeIndex={setActiveTokenIndex}
                tokenList={tokenList}
                chainId={chainId}
            />
        </motion.article>
    );
});
