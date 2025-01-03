'use client';

import { ChainId, SchemaType } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';
import { isUndefined } from 'lodash-es';
import { notFound } from 'next/navigation.js';

import { Loading } from '@/components/Loading.js';
import { Attendees } from '@/components/NFTDetail/Attendees.js';
import { NFTInfo } from '@/components/NFTDetail/NFTInfo.js';
import { NFTOverflow } from '@/components/NFTDetail/NFTOverflow.js';
import { NFTProperties } from '@/components/NFTDetail/NFTProperties.js';
import { NFTNavbar } from '@/components/NFTs/NFTNavbar.js';
import { POAP_CONTRACT_ADDRESS } from '@/constants/index.js';
import { getFloorPrice } from '@/helpers/getFloorPrice.js';
import { isSameEthereumAddress } from '@/helpers/isSameAddress.js';
import { useNFTDetail } from '@/hooks/useNFTDetail.js';
import { SimpleHashProvider } from '@/providers/simplehash/index.js';

export function NFTDetailPage({ chainId, address, tokenId }: { chainId: ChainId; address: string; tokenId: string }) {
    const isPoap = isSameEthereumAddress(address, POAP_CONTRACT_ADDRESS);

    const { data, isLoading } = useNFTDetail(address, tokenId, chainId);

    const { data: poapEvent } = useQuery({
        queryKey: ['post-event', data?.metadata?.eventId],
        async queryFn() {
            return SimpleHashProvider.getPoapEvent(data?.metadata?.eventId!);
        },
        enabled: !!data?.metadata?.eventId,
    });

    if (isLoading) {
        return <Loading />;
    }

    if (!data?.metadata) {
        notFound();
    }
    const poapAttendeesCount = poapEvent?.total ?? 0;

    return (
        <div className="min-h-screen">
            <NFTNavbar>{data.metadata.name}</NFTNavbar>
            <div className="space-y-4 px-4 py-3">
                <NFTInfo
                    imageURL={data.metadata.imageURL ?? ''}
                    video={data.metadata.video}
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
                    attendance={poapAttendeesCount}
                    externalUrl={data.externalUrl}
                    traits={data.traits ?? []}
                    contract={data.__origin__?.contract}
                />
                {!isPoap && data.traits?.length ? <NFTProperties items={data.traits} /> : null}
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
