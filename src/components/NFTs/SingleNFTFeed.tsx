import { ChainId } from '@masknet/web3-shared-evm';
import { motion } from 'framer-motion';
import { first, isUndefined } from 'lodash-es';
import { useRouter } from 'next/navigation.js';
import { memo, useMemo } from 'react';
import type { Address } from 'viem';

import { NFTsActivityCellAction } from '@/components/ActivityCell/NFTs/NFTsActivityCellAction.js';
import { NFTsActivityCellCard } from '@/components/ActivityCell/NFTs/NFTsActivityCellCard.js';
import { Avatar } from '@/components/Avatar.js';
import { FeedFollowSource } from '@/components/FeedFollowSource.js';
import { type NFTFeedBodyProps } from '@/components/NFTs/NFTFeedBody.js';
import { NFTFeedHeader } from '@/components/NFTs/NFTFeedHeader.js';
import { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { stopPropagation } from '@/helpers/stopEvent.js';
import { type FollowingNFT, type NFTOwnerDisplayInfo } from '@/providers/types/NFTs.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

interface SingleNFTFeedProps {
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
    const token = tokenList[0];
    const nftUrl = useMemo(() => {
        if (!token) return null;
        return resolveNftUrl(chainId, token.contractAddress, token.id);
    }, [chainId, token]);

    const authorUrl = resolveProfileUrl(Source.Wallet, ownerAddress);

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
            <FeedFollowSource source={first(followingSources)} />
            <div className="flex gap-3">
                <Link href={authorUrl} className="z-[1] flex-shrink-0" onClick={stopPropagation}>
                    <Avatar className="h-10 w-10" src={displayInfo.avatarUrl} size={40} alt={ownerAddress} />
                </Link>
                <article className="min-w-0 flex-grow">
                    <NFTFeedHeader
                        address={ownerAddress}
                        contractAddress={contractAddress}
                        tokenId={token.id}
                        chainId={chainId}
                        displayInfo={displayInfo}
                        time={time}
                    />
                    <NFTsActivityCellAction
                        address={tokenList[0].contractAddress}
                        chainId={chainId}
                        tokenId={tokenList[0].id}
                        action={tokenList[0].action.action}
                        toAddress={tokenList[0].action.toAddress}
                        fromAddress={tokenList[0].action.fromAddress}
                        ownerAddress={tokenList[0].action.ownerAddress}
                        tokenCount={tokenList.length}
                    />
                    <div className="mt-1.5 flex w-full space-x-3 overflow-x-auto overflow-y-hidden">
                        {tokenList.map(({ id, action, contractAddress }) => {
                            return (
                                <NFTsActivityCellCard
                                    key={`${id}-${contractAddress}-${chainId}`}
                                    action={action.action}
                                    address={contractAddress}
                                    chainId={chainId}
                                    tokenId={id}
                                />
                            );
                        })}
                    </div>
                </article>
            </div>
        </motion.article>
    );
});
