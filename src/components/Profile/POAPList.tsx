'use client';

import { Trans } from '@lingui/macro';
import { ChainId } from '@masknet/web3-shared-evm';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { forwardRef } from 'react';
import type { GridItemProps, GridListProps } from 'react-virtuoso';
import type { Hex } from 'viem';
import { useEnsName } from 'wagmi';

import PoapIcon from '@/assets/poap.svg';
import { GridListInPage } from '@/components/GridListInPage.js';
import { Link } from '@/components/Link.js';
import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { NFTImage } from '@/components/NFTImage.js';
import { BookmarkInIcon } from '@/components/NFTs/BookmarkButton.js';
import { Source } from '@/constants/enum.js';
import { EMPTY_LIST, POAP_CONTRACT_ADDRESS } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { formatEthereumAddress } from '@/helpers/formatAddress.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { createIndicator } from '@/helpers/pageable.js';
import { resolveNFTIdFromAsset } from '@/helpers/resolveNFTIdFromAsset.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { SimpleHashProvider } from '@/providers/simplehash/index.js';
import type { NFTAsset } from '@/providers/types/Firefly.js';
import { fillBookmarkStatusForNonFungibleAssets } from '@/services/fillBookmarkStatusForNFT.js';

const GridList = forwardRef<HTMLDivElement, GridListProps>(function GridList({ className, children, ...props }, ref) {
    return (
        <div
            ref={ref}
            {...props}
            className={classNames('grid grid-cols-3 gap-3.5 md:grid-cols-4 lg:grid-cols-3', className)}
        >
            {children}
        </div>
    );
});

const GridItem = forwardRef<HTMLDivElement, GridItemProps>(function GridItem({ children, ...props }, ref) {
    return <div {...props}>{children}</div>;
});

function Owner({ address }: { address: Hex }) {
    const { data: ensName } = useEnsName({ address, chainId: ChainId.Mainnet });
    return (
        <Link
            href={resolveProfileUrl(Source.Wallet, address)}
            className="absolute left-2 top-2 max-w-[100px] truncate rounded-full bg-[rgba(24,26,32,0.50)] px-2 py-1 text-[10px] font-medium leading-4 text-white backdrop-blur-md"
            onClickCapture={(e) => e.stopPropagation()}
        >
            {ensName ? ensName : formatEthereumAddress(address, 4)}
        </Link>
    );
}

function NFTItemContent({
    index,
    item,
    ...props
}: {
    index: number;
    item: NFTAsset;
    isPoap?: boolean;
    isShowOwner?: boolean;
    isShowChainIcon?: boolean;
    ownerCount?: number;
}) {
    const nftUrl = resolveNftUrl(item.chainId, item.id, item.tokenId || '0');

    return (
        <div className="relative">
            <Link
                href={nftUrl}
                key={`${index}-${item.id}-${item.tokenId}`}
                className="flex cursor-pointer flex-col rounded-lg bg-bg pb-1 sm:rounded-2xl"
            >
                <div className="relative aspect-square h-auto w-full overflow-hidden">
                    {props?.isShowChainIcon ? (
                        <ChainIcon chainId={item.chainId} size={20} className="absolute left-2 top-2 h-4 w-4" />
                    ) : null}
                    {props?.isPoap ? <PoapIcon className="absolute left-2 top-2 h-6 w-6" /> : null}
                    {props?.isShowOwner && item.owner?.address ? <Owner address={item.owner.address as Hex} /> : null}
                    {props?.ownerCount ? (
                        <div className="absolute left-2 top-2 z-10 h-5 rounded-lg bg-primaryBottom px-1 text-xs font-bold leading-5">
                            <Trans>× {nFormatter(props.ownerCount)}</Trans>
                        </div>
                    ) : null}
                    <NFTImage
                        width={500}
                        height={500}
                        className="h-full w-full rounded-lg object-cover"
                        src={item.metadata?.imageURL ?? ''}
                        alt="nft_image"
                    />
                </div>
                <div className="mt-1 line-clamp-2 h-8 w-full px-1 text-center text-xs font-medium leading-4 sm:mt-2 sm:px-2 sm:py-0">
                    {item.metadata?.name}
                </div>
            </Link>
            <BookmarkInIcon
                className="absolute right-2 top-2 z-10"
                nftId={resolveNFTIdFromAsset(item)}
                ownerAddress={item.owner?.address}
                bookmarked={item.hasBookmarked}
            />
        </div>
    );
}

export function getNFTItemContent(
    index: number,
    item: NFTAsset,
    options?: {
        isPoap?: boolean;
        isShowOwner?: boolean;
        isShowChainIcon?: boolean;
        ownerCount?: number;
    },
) {
    return <NFTItemContent index={index} item={item} {...options} />;
}

export const POAPGridListComponent = {
    List: GridList,
    Item: GridItem,
};

export function POAPList(props: { address: string }) {
    const { address } = props;
    const queryResult = useSuspenseInfiniteQuery({
        initialPageParam: '',
        queryKey: ['poap-list', address],
        async queryFn({ pageParam }) {
            const indicator = createIndicator(
                pageParam
                    ? {
                          index: 1,
                          __type__: 'PageIndicator',
                          id: pageParam,
                      }
                    : undefined,
                pageParam,
            );
            const response = await SimpleHashProvider.getPOAPs(address, {
                indicator,
                chainId: ChainId.xDai,
                contractAddress: POAP_CONTRACT_ADDRESS,
            });

            return {
                ...response,
                data: await fillBookmarkStatusForNonFungibleAssets(response.data),
            };
        },
        getNextPageParam: (lastPage) => lastPage?.nextIndicator?.id,
        select: (data) => data.pages.flatMap((page) => page.data ?? EMPTY_LIST),
    });

    return (
        <div className="px-3">
            <GridListInPage
                queryResult={queryResult}
                className="mt-5"
                VirtualGridListProps={{
                    components: POAPGridListComponent,
                    itemContent: (index, item) => {
                        return getNFTItemContent(index, item as NFTAsset, {
                            isPoap: true,
                        });
                    },
                }}
                NoResultsFallbackProps={{
                    className: 'md:pt-[228px] max-md:py-20',
                }}
            />
        </div>
    );
}
