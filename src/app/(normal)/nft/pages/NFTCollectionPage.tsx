'use client';

import { ChainId } from '@masknet/web3-shared-evm';
import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';

import { NFTCollection } from '@/components/CollectionDetail/NFTCollection.js';
import { SimpleHashProvider } from '@/providers/simplehash/index.js';

export function NFTCollectionPage({ chainId, address }: { chainId: ChainId; address: string }) {
    const { data } = useSuspenseQuery({
        queryKey: ['nft-collection', chainId, address],
        async queryFn() {
            return SimpleHashProvider.getCollection(address, { chainId });
        },
    });

    if (!data) notFound();

    return <NFTCollection collection={data} address={address} chainId={chainId} />;
}

export function NFTCollectionPageById({ collectionId }: { collectionId: string }) {
    const { data } = useSuspenseQuery({
        queryKey: ['nft-collection', collectionId],
        async queryFn() {
            return SimpleHashProvider.getCollectionById(collectionId);
        },
    });

    if (!data) notFound();

    return <NFTCollection collection={data} />;
}
