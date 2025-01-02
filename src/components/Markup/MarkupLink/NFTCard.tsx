'use client';

import { ZERO_ADDRESS } from '@masknet/web3-shared-evm';
import { memo } from 'react';

import { Link } from '@/components/Link.js';
import { Loading } from '@/components/Loading.js';
import { NFTImage } from '@/components/NFTImage.js';
import { useNFTDetail } from '@/hooks/useNFTDetail.js';

interface NFTCardProps {
    chainId: number;
    contractAddress: string;
    tokenId: string;
    sourceLink: string;
}

export const NFTCard = memo<NFTCardProps>(function NFTCard({ chainId, contractAddress, tokenId, sourceLink }) {
    const { data: nft, isLoading } = useNFTDetail(contractAddress ?? ZERO_ADDRESS, tokenId, chainId);

    if (isLoading) {
        return <Loading />;
    }

    if (!nft) return null;

    return (
        <Link
            className="my-5 flex w-full items-center justify-center"
            href={sourceLink}
            target="_blank"
            rel="noopener noreferrer"
        >
            <div className="max-w-[250px] rounded-lg bg-bg">
                <NFTImage
                    src={nft?.metadata?.previewImageURL || nft?.metadata?.imageURL || ''}
                    width={120}
                    height={120}
                    className="aspect-square h-full w-full rounded-xl object-cover sm:mb-0 sm:w-auto"
                    draggable={false}
                    alt={contractAddress ?? ''}
                />
                <div className="p-2">
                    <div className="mb-2 text-base font-bold text-main">{nft?.metadata?.name}</div>
                    <div className="flex items-center">
                        <div className="rounded-lg bg-primaryBottom p-2 text-xs">{nft?.collection?.name}</div>
                    </div>
                </div>
            </div>
        </Link>
    );
});
