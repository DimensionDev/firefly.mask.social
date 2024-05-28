'use client';

import { createIndicator, EMPTY_LIST } from '@masknet/shared-base';
import { ChainId } from '@masknet/web3-shared-evm';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { first } from 'lodash-es';
import { useMemo } from 'react';

import { GridListInPage } from '@/components/GridListInPage.js';
import { Image } from '@/components/Image.js';
import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { POAPGridListComponent } from '@/components/Profile/POAPList.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';
import { resolveSimpleHashChainId } from '@/helpers/resolveSimpleHashChainId.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { Collection } from '@/providers/types/Firefly.js';

export interface NFTCollectionItemProps {
    collection: Collection;
    onClick?: (chainId: ChainId, collectionId: string, collection: Collection) => void;
}

export function NFTCollectionItem({ collection, onClick }: NFTCollectionItemProps) {
    const distinctNFTCount = collection.distinct_nfts_owned;
    const images = useMemo(() => {
        let previewImages = collection.nftPreviews ?? [];
        if (distinctNFTCount > 4 && previewImages.length >= 4) {
            previewImages = previewImages.slice(0, 3);
        }
        return previewImages.map((preview) => preview.previews.image_medium_url);
    }, [distinctNFTCount, collection.nftPreviews]);

    const chainId = useMemo(() => {
        const chain = first(collection.collection_details.chains);
        if (!chain) return null;
        return resolveSimpleHashChainId(chain);
    }, [collection.collection_details.chains]);

    if (collection.nftPreviews?.length === 1 && distinctNFTCount === 1) {
        const nftPreview = first(collection.nftPreviews);
        if (nftPreview) {
            const tokenId = nftPreview.nft_id.split('.')?.[2];
            return (
                <Link
                    href={resolveNftUrl(nftPreview.contract_address, {
                        tokenId,
                        chainId,
                    })}
                    className="relative flex flex-col rounded-lg bg-bg pb-1 sm:rounded-2xl"
                >
                    {chainId ? (
                        <div className="absolute left-1 top-1 z-10">
                            <ChainIcon chainId={chainId} size={20} />
                        </div>
                    ) : null}
                    <div className="relative aspect-square h-auto w-full overflow-hidden">
                        <Image
                            width={500}
                            height={500}
                            className="h-full w-full rounded-lg object-cover"
                            src={nftPreview.image_url}
                            alt="nft_image"
                        />
                    </div>
                    <div className="mt-1 line-clamp-2 h-8 w-full px-1 text-center text-xs font-medium leading-4 sm:mt-2 sm:px-2 sm:py-0">
                        {nftPreview.name}
                    </div>
                </Link>
            );
        }
    }

    return (
        <div
            className="relative flex cursor-pointer flex-col rounded-lg bg-lightBg p-1.5 pb-1 sm:rounded-2xl"
            onClick={() => {
                if (chainId) {
                    onClick?.(chainId, collection.collection_id, collection);
                }
            }}
        >
            {chainId ? (
                <div className="absolute left-1 top-1 z-10">
                    <ChainIcon chainId={chainId} size={20} />
                </div>
            ) : null}
            <div
                className={classNames('relative grid aspect-square h-auto w-full gap-1.5 overflow-hidden', {
                    'grid-cols-2 grid-rows-2': images.length > 1,
                })}
            >
                {images.map((url, i) => (
                    <Image
                        key={`${url}-${i}`}
                        width={500}
                        height={500}
                        className="h-full w-full rounded-lg object-cover"
                        src={url}
                        alt="nft_image"
                    />
                ))}
                {images.length === 3 && distinctNFTCount !== 4 && distinctNFTCount > 3 ? (
                    <div className="flex h-full w-full items-center justify-center rounded-lg bg-lightBottom text-xs font-normal leading-4 dark:bg-primaryBottom sm:rounded-xl">
                        +{distinctNFTCount - 3}
                    </div>
                ) : null}
            </div>
            <div className="mt-1 line-clamp-2 h-8 w-full px-1 text-center text-xs font-medium leading-4 sm:mt-2 sm:px-2 sm:py-0">
                {collection.collection_details.name}
            </div>
        </div>
    );
}

export function getNFTItemContent(index: number, props: NFTCollectionItemProps) {
    return <NFTCollectionItem key={`${props.collection.collection_id}-${index}`} {...props} />;
}

export interface NFTCollectionListProps {
    address: string;
    onClickCollection?: NFTCollectionItemProps['onClick'];
}

export function NFTCollectionList(props: NFTCollectionListProps) {
    const { address, onClickCollection } = props;
    const queryResult = useSuspenseInfiniteQuery({
        initialPageParam: '',
        queryKey: ['nft-collection-list', address],
        async queryFn({ pageParam }) {
            const indicator = createIndicator(undefined, pageParam);
            return FireflySocialMediaProvider.getNFTCollections({ walletAddress: address, indicator });
        },
        getNextPageParam: (lastPage) => lastPage?.nextIndicator?.id,
        select: (data) => data.pages.flatMap((page) => page.data ?? EMPTY_LIST),
    });

    return (
        <GridListInPage
            queryResult={queryResult}
            VirtualGridListProps={{
                components: POAPGridListComponent,
                itemContent: (index, collection) => {
                    return getNFTItemContent(index, {
                        collection,
                        onClick: onClickCollection,
                    });
                },
            }}
        />
    );
}
