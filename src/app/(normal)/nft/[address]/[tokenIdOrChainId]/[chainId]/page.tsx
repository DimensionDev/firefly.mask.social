'use client';

import { SchemaType } from '@masknet/web3-shared-evm';
import { isUndefined } from 'lodash-es';
import { notFound } from 'next/navigation.js';

import { Loading } from '@/components/Loading.js';
import { Attendees } from '@/components/NFTDetail/Attendees.js';
import { NFTInfo } from '@/components/NFTDetail/NFTInfo.js';
import { NFTOverflow } from '@/components/NFTDetail/NFTOverflow.js';
import { NFTProperties } from '@/components/NFTDetail/NFTProperties.js';
import { NFTNavbar } from '@/components/NFTs/NFTNavbar.js';
import { POAP_CONTRACT_ADDRESS } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { getFloorPrice } from '@/helpers/getFloorPrice.js';
import { isSameEthereumAddress } from '@/helpers/isSameAddress.js';
import { useNFTDetail } from '@/hooks/useNFTDetail.js';
import { usePoapAttendeesCount } from '@/hooks/usePoapAttendeesCount.js';

export default function Page({
    params: { address, tokenIdOrChainId: tokenId, ...params },
}: {
    params: {
        address: string;
        tokenIdOrChainId: string;
        chainId: string;
    };
}) {
    const chainId = params.chainId ? Number.parseInt(params.chainId as string, 10) : undefined;
    const isPoap = isSameEthereumAddress(address, POAP_CONTRACT_ADDRESS);

    const { data, isLoading, error } = useNFTDetail(address, tokenId, chainId);
    const { data: poapAttendeesCount } = usePoapAttendeesCount(data?.metadata?.eventId);

    if (isLoading) {
        return <Loading />;
    }

    if (error || !data?.metadata) {
        notFound();
    }

    return (
        <div className="min-h-screen">
            <NFTNavbar>{data.metadata.name}</NFTNavbar>
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
                    attendance={poapAttendeesCount}
                    tokenNameClassName={classNames({ '!line-clamp-3': isPoap })}
                />
                {data.traits && data.traits.length > 0 ? <NFTProperties items={data.traits} /> : null}
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