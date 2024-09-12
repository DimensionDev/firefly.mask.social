'use client';

import { memo } from 'react';

import { Loading } from '@/components/Loading.js';
import { NFTImage } from '@/components/NFTImage.js';
import { useNFTCollection } from '@/hooks/useNFTCollection.js';

interface NFTCollectionProps {
    contractAddress: string;
    chainId: number;
    sourceLink: string;
}

export const NFTCollection = memo<NFTCollectionProps>(function NFTCard({ contractAddress, chainId, sourceLink }) {
    const { data: collection, isLoading } = useNFTCollection(contractAddress, chainId);

    if (isLoading) {
        return <Loading />;
    }

    if (!collection) return null;

    return (
        <a
            className="my-5 flex w-full items-center justify-center"
            href={sourceLink}
            target="_blank"
            rel="noopener noreferrer"
        >
            <div className="max-w-[250px] rounded-lg bg-bg">
                <NFTImage
                    src={collection.banner_image_url}
                    width={120}
                    height={120}
                    className="aspect-square h-full w-full rounded-xl object-cover sm:mb-0 sm:w-auto"
                    draggable={false}
                    alt={contractAddress ?? ''}
                />
                <div className="p-2">
                    <div className="mb-2 text-base font-bold text-main">{collection.name}</div>
                </div>
            </div>
        </a>
    );
});
