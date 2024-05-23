'use client';

import { createIndicator, EMPTY_LIST } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { GridListInPage } from '@/components/GridListInPage.js';
import { Image } from '@/components/Image.js';
import { POAPGridListComponent } from '@/components/Profile/POAPList.js';
import { classNames } from '@/helpers/classNames.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { Collection } from '@/providers/types/Firefly.js';

export interface NFTCollectionItemProps {
    collection: Collection;
    onClick?: (collection: Collection) => void;
}

export function NFTCollectionItem({ collection, onClick }: NFTCollectionItemProps) {
    const distinctNFTCount = collection.collection_details.distinct_nft_count;
    const images = useMemo(() => {
        if (!collection.nftPreviews) return [];
        let previewImages = collection.nftPreviews;
        if (collection.nftPreviews.length === 4 && distinctNFTCount === 4) {
            previewImages = previewImages.slice(0, 4);
        } else {
            previewImages = previewImages.slice(0, 3);
        }
        if (distinctNFTCount > 4) {
            if (previewImages.length < 3) previewImages = [...previewImages, ...previewImages, ...previewImages];
            else if (previewImages.length < 2) previewImages = [...previewImages, ...previewImages];
        }
        return previewImages.map((preview) => preview.previews.image_medium_url);
    }, [distinctNFTCount, collection.nftPreviews]);

    return (
        <div
            className="flex cursor-pointer flex-col rounded-lg bg-lightBg p-1.5 pb-1 sm:rounded-2xl"
            onClick={() => onClick?.(collection)}
        >
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
                    <div className="flex h-full w-full items-center justify-center rounded-lg bg-white text-xs font-normal leading-4 dark:bg-[#202020] sm:rounded-xl">
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
    onClickCollection?: (collection: Collection) => void;
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
