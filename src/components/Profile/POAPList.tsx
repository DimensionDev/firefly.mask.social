'use client';

import { createIndicator, EMPTY_LIST } from '@masknet/shared-base';
import type { NonFungibleAsset } from '@masknet/web3-shared-base';
import { ChainId, formatEthereumAddress, SchemaType } from '@masknet/web3-shared-evm';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { forwardRef } from 'react';
import type { GridItemProps, GridListProps } from 'react-virtuoso';

import PoapIcon from '@/assets/poap.svg';
import { GridListInPage } from '@/components/GridListInPage.js';
import { Image } from '@/components/Image.js';
import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { Source } from '@/constants/enum.js';
import { POAP_CONTRACT_ADDRESS } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { useEnsNameWithChainbase } from '@/hooks/useEnsNameWithChainbase.js';
import { SimpleHashWalletProfileProvider } from '@/providers/simplehash/WalletProfile.js';

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

function Owner({ address }: { address: string }) {
    const { data: ensName } = useEnsNameWithChainbase(address);
    return (
        <Link
            href={resolveProfileUrl(Source.Wallet, ensName ? ensName : address)}
            className="absolute left-2 top-2 max-w-[100px] truncate rounded-full bg-[rgba(24,26,32,0.50)] px-2 py-1 text-[10px] font-medium leading-4 text-white backdrop-blur-md"
            onClickCapture={(e) => e.stopPropagation()}
        >
            {ensName ? ensName : formatEthereumAddress(address, 4)}
        </Link>
    );
}

export function getNFTItemContent(
    index: number,
    item: NonFungibleAsset<ChainId.Mainnet, SchemaType.ERC721>,
    options?: {
        isPoap?: boolean;
        isShowOwner?: boolean;
        isShowChainIcon?: boolean;
    },
) {
    return (
        <Link
            href={resolveNftUrl(item.id, {
                tokenId: item.tokenId,
                chainId: item.chainId,
            })}
            key={`${index}-${item.id}-${item.tokenId}`}
            className="flex flex-col rounded-lg bg-bg pb-1 sm:rounded-2xl"
        >
            <div className="relative aspect-square h-auto w-full overflow-hidden">
                {options?.isShowChainIcon ? (
                    <ChainIcon chainId={item.chainId} size={20} className="absolute left-2 top-2 h-4 w-4" />
                ) : null}
                {options?.isPoap ? <PoapIcon className="absolute left-2 top-2 h-6 w-6" /> : null}
                {options?.isShowOwner && item.owner?.address ? <Owner address={item.owner.address} /> : null}
                <Image
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
    );
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
            return SimpleHashWalletProfileProvider.getPOAPs(address, {
                indicator,
                chainId: ChainId.xDai,
                contractAddress: POAP_CONTRACT_ADDRESS,
            });
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
                        return getNFTItemContent(index, item as NonFungibleAsset<ChainId.Mainnet, SchemaType.ERC721>, {
                            isPoap: true,
                        });
                    },
                }}
            />
        </div>
    );
}
