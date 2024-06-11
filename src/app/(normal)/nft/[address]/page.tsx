'use client';

import { TextOverflowTooltip } from '@masknet/theme';
import { ChainId } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';

import ComeBack from '@/assets/comeback.svg';
import { CollectionInfo } from '@/components/CollectionDetail/CollectionInfo.js';
import { CollectionTabs } from '@/components/CollectionDetail/CollectionTabs.js';
import { Loading } from '@/components/Loading.js';
import type { SourceInURL } from '@/constants/enum.js';
import { getFloorPrice } from '@/helpers/getFloorPrice.js';
import { useComeBack } from '@/hooks/useComeback.js';
import { SimpleHashWalletProfileProvider } from '@/providers/simplehash/WalletProfile.js';

export default function Page({
    params,
    searchParams,
}: {
    params: { address: string };
    searchParams: { source: SourceInURL; chainId: string };
}) {
    const chainId: ChainId | undefined = searchParams.chainId
        ? Number.parseInt(searchParams.chainId as string, 10)
        : undefined;
    const comeback = useComeBack();
    const { address } = params;
    const { data, isLoading, error } = useQuery({
        queryKey: ['collection-info', address, chainId],
        queryFn() {
            return SimpleHashWalletProfileProvider.getCollection(address, { chainId });
        },
    });

    if (isLoading) {
        return <Loading />;
    }

    if (error || !data) {
        notFound();
    }

    return (
        <div className="min-h-screen">
            <div className="sticky top-0 z-40 flex items-center border-b border-line bg-primaryBottom px-4 py-[18px]">
                <ComeBack width={24} height={24} className="mr-8 cursor-pointer" onClick={comeback} />
                <TextOverflowTooltip title={data?.name}>
                    <h2 className="max-w-[calc(100%-24px-32px)] truncate text-xl font-black leading-6">{data?.name}</h2>
                </TextOverflowTooltip>
            </div>
            {data ? (
                <CollectionInfo
                    address={params.address}
                    name={data.name}
                    bannerImageUrl={data.banner_image_url}
                    imageUrl={data.image_url}
                    nftCount={data.distinct_nft_count}
                    ownerCount={data.distinct_owner_count}
                    floorPrice={getFloorPrice(data?.floor_prices)}
                    chainId={chainId}
                    collectionId={data.collection_id}
                />
            ) : null}
            <CollectionTabs address={address} chainId={chainId} totalQuantity={data?.total_quantity} />
        </div>
    );
}
