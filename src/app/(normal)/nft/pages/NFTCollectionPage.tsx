'use client';

import { ChainId } from '@masknet/web3-shared-evm';
import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';

import { NFTCollection } from '@/components/CollectionDetail/NFTCollection.js';
import { resolveWalletProfileProvider } from '@/helpers/resolveWalletProfileProvider.js';

export function NFTCollectionPage({ chainId, address }: { chainId: ChainId; address: string }) {
    const { data } = useSuspenseQuery({
        queryKey: ['nft-collection', chainId, address],
        async queryFn() {
            const provider = resolveWalletProfileProvider(chainId);
            return provider.getCollection(address, { chainId });
        },
    });

    if (!data) notFound();

    return <NFTCollection collection={data} address={address} chainId={chainId} />;
}

export function NFTCollectionPageById({ collectionId }: { collectionId: string }) {
    const { data } = useSuspenseQuery({
        queryKey: ['nft-collection', collectionId],
        async queryFn() {
            const provider = resolveWalletProfileProvider();
            return provider.getCollectionById(collectionId);
        },
    });

    if (!data) notFound();

    return <NFTCollection collection={data} />;
}
