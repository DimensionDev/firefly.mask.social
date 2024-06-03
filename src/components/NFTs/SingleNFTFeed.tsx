import { ChainId } from '@masknet/web3-shared-evm';
import { motion } from 'framer-motion';
import { isUndefined } from 'lodash-es';
import { useRouter } from 'next/navigation.js';
import { useState } from 'react';

import { NFTFeedBody } from '@/components/NFTs/NFTFeedBody.js';
import { NFTFeedHeader } from '@/components/NFTs/NFTFeedHeader.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';
import { NFTFeedTransAction, type NFTOwnerDisplayInfo } from '@/providers/types/NFTs.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export interface SingleNFTFeedProps {
    disableAnimate?: boolean;
    listKey?: string;
    index?: number;
    contractAddress: string;
    tokenList: Array<{ id: string }>;
    chainId: ChainId;
    displayInfo: NFTOwnerDisplayInfo;
    time: number | string | Date;
    action: NFTFeedTransAction;
}

export function SingleNFTFeed({
    contractAddress,
    tokenList,
    chainId,
    displayInfo,
    disableAnimate,
    listKey,
    index,
    time,
    action,
}: SingleNFTFeedProps) {
    const setScrollIndex = useGlobalState.use.setScrollIndex();
    const router = useRouter();
    const nftUrl = resolveNftUrl(contractAddress);
    const [activeTokenIndex, setActiveTokenIndex] = useState(0);

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
                router.push(nftUrl);
            }}
            onMouseEnter={() => {
                router.prefetch(nftUrl);
            }}
        >
            <NFTFeedHeader address={contractAddress} chainId={chainId} displayInfo={displayInfo} time={time} />
            <NFTFeedBody
                index={activeTokenIndex}
                onChangeIndex={setActiveTokenIndex}
                tokenList={tokenList}
                contractAddress={contractAddress}
                action={action}
            />
        </motion.article>
    );
}
