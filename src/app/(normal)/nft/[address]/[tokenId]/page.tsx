'use client';

import { TextOverflowTooltip } from '@masknet/theme';
import { isSameAddress } from '@masknet/web3-shared-base';
import { SchemaType } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';
import { isUndefined } from 'lodash-es';
import { notFound } from 'next/navigation.js';

import ComeBack from '@/assets/comeback.svg';
import { Loading } from '@/components/Loading.js';
import { Attendees } from '@/components/NFTDetail/Attendees.js';
import { NFTInfo } from '@/components/NFTDetail/NFTInfo.js';
import { NFTOverflow } from '@/components/NFTDetail/NFTOverflow.js';
import { NFTProperties } from '@/components/NFTDetail/NFTProperties.js';
import { POAP_CONTRACT_ADDRESS } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { getFloorPrice } from '@/helpers/getFloorPrice.js';
import { useComeBack } from '@/hooks/useComeback.js';
import { useNFTDetail } from '@/hooks/useNFTDetail.js';
import { SimpleHashWalletProfileProvider } from '@/providers/simplehash/WalletProfile.js';
import type { SearchParams } from '@/types/index.js';

export default function Page({
    params: { address, tokenId },
    searchParams,
}: {
    params: {
        address: string;
        tokenId: string;
    };
    searchParams: SearchParams;
}) {
    const comeback = useComeBack();
    const chainId = searchParams.chainId ? Number.parseInt(searchParams.chainId as string, 10) : undefined;
    const isPoap = isSameAddress(address, POAP_CONTRACT_ADDRESS);

    const { data, isLoading, error } = useNFTDetail(address, tokenId, chainId);

    const { data: collectionData } = useQuery({
        queryKey: ['collection-info', address, chainId],
        queryFn() {
            return SimpleHashWalletProfileProvider.getCollection(address, { chainId });
        },
        enabled: isPoap,
    });

    if (isLoading) {
        return <Loading />;
    }

    if (error || !data?.metadata) {
        notFound();
    }

    return (
        <div className="min-h-screen">
            <div className="sticky top-0 z-40 flex items-center border-b border-line bg-primaryBottom px-4 py-[18px]">
                <ComeBack width={24} height={24} className="mr-8 cursor-pointer" onClick={comeback} />
                <TextOverflowTooltip title={data.metadata.name}>
                    <h2 className="max-w-[calc(100%-24px-32px)] truncate text-xl font-black leading-6">
                        {data.metadata.name}
                    </h2>
                </TextOverflowTooltip>
            </div>
            <div className="space-y-6 p-5">
                <NFTInfo
                    imageURL={data.metadata.imageURL ?? ''}
                    name={data.metadata.name ?? ''}
                    tokenId={data.metadata.tokenId ?? ''}
                    ownerAddress={data.contract?.schema === SchemaType.ERC1155 ? undefined : data.owner?.address}
                    contractAddress={data.contract?.address ?? ''}
                    collection={{
                        name: data.contract?.name ?? '',
                        icon: data.collection?.iconURL ?? undefined,
                        id: data.collection?.id,
                    }}
                    isPoap={isPoap}
                    floorPrice={getFloorPrice(data?.collection?.floorPrices)}
                    chainId={chainId}
                    attendance={collectionData?.distinct_owner_count}
                    tokenNameClassName={classNames({ '!line-clamp-3': isPoap })}
                />
                {data.traits && data.traits.length > 0 ? (
                    <NFTProperties
                        items={data.traits.map((trait) => ({
                            label: trait.type,
                            value: trait.value,
                        }))}
                    />
                ) : null}
                <NFTOverflow
                    description={data.metadata.description ?? ''}
                    tokenId={data.tokenId}
                    contractAddress={data.contract?.address ?? ''}
                    creator={data.creator?.address}
                    chainId={data.chainId}
                    schemaType={data.contract?.schema}
                />
                {isPoap && !isUndefined(data.metadata.eventId) ? <Attendees eventId={data.metadata.eventId} /> : null}
            </div>
        </div>
    );
}
