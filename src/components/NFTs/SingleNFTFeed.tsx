import { ChainId } from '@masknet/web3-shared-evm';
import { motion } from 'framer-motion';
import { isUndefined } from 'lodash-es';
import { useRouter } from 'next/navigation.js';
import { memo, useMemo, useState } from 'react';

import { NFTFeedBody, type NFTFeedBodyProps } from '@/components/NFTs/NFTFeedBody.js';
import { NFTFeedHeader } from '@/components/NFTs/NFTFeedHeader.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';
import { type NFTOwnerDisplayInfo } from '@/providers/types/NFTs.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export interface SingleNFTFeedProps {
    ownerAddress: string;
    disableAnimate?: boolean;
    listKey?: string;
    index?: number;
    tokenList: NFTFeedBodyProps['tokenList'];
    chainId: ChainId;
    displayInfo: NFTOwnerDisplayInfo;
    time: number | string | Date;
}

export const SingleNFTFeed = memo(function SingleNFTFeed({
    ownerAddress,
    tokenList,
    chainId,
    displayInfo,
    disableAnimate,
    listKey,
    index,
    time,
}: SingleNFTFeedProps) {
    const setScrollIndex = useGlobalState.use.setScrollIndex();
    const router = useRouter();
    const [activeTokenIndex, setActiveTokenIndex] = useState(0);
    const nftUrl = useMemo(() => {
        const token = tokenList[activeTokenIndex];
        if (!token) return null;
        return resolveNftUrl(token.contractAddress, {
            chainId,
            tokenId: token.id,
        });
    }, [activeTokenIndex, chainId, tokenList]);

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
            <NFTFeedHeader address={ownerAddress} chainId={chainId} displayInfo={displayInfo} time={time} />
            <NFTFeedBody
                index={activeTokenIndex}
                onChangeIndex={setActiveTokenIndex}
                tokenList={tokenList}
                chainId={chainId}
            />
        </motion.article>
    );
});
