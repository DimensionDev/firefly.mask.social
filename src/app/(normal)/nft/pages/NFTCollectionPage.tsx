'use client';

import { ChainId } from '@masknet/web3-shared-evm';
import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';

import { NFTCollection } from '@/components/CollectionDetail/NFTCollection.js';
import { SimpleHashWalletProfileProvider } from '@/providers/simplehash/WalletProfile.js';

export function NFTCollectionPage({ chainId, address }: { chainId: ChainId; address: string }) {
    const { data } = useSuspenseQuery({
        queryKey: ['nft-collection', chainId, address],
        async queryFn() {
            return SimpleHashWalletProfileProvider.getCollection(address, { chainId });
        },
    });

    if (!data) notFound();

    return <NFTCollection collection={data} address={address} chainId={chainId} />;
}

export function NFTCollectionPageById({ collectionId }: { collectionId: string }) {
    const { data } = useSuspenseQuery({
        queryKey: ['nft-collection', collectionId],
        async queryFn() {
            return SimpleHashWalletProfileProvider.getCollectionById(collectionId);
        },
    });

    if (!data) notFound();

    return <NFTCollection collection={data} />;
}
