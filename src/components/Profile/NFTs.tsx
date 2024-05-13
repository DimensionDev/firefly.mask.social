'use client';

import { resolveChainId } from '@masknet/web3-providers';
import { useMemo, useState } from 'react';

import UndoSVG from '@/assets/undo.svg';
import { NFTList } from '@/components/CollectionDetail/NFTList.js';
import { Image } from '@/components/Image.js';
import { NFTCollectionList } from '@/components/Profile/NFTCollectionList.js';
import type { CollectionDetails } from '@/providers/types/Firefly.js';

export function NFTs(props: { address: string }) {
    const { address } = props;
    const [selectedCollection, setSelectedCollection] = useState<CollectionDetails | null>(null);

    const [selectedCollectionContractChainId, selectedCollectionContractAddress] = useMemo(() => {
        if (!selectedCollection) return [null, null];
        if (!selectedCollection.top_contracts?.[0]) return [null, null];
        const [chain, address] = selectedCollection.top_contracts[0].split('.');
        return [resolveChainId(chain), address];
    }, [selectedCollection]);

    return (
        <div className="px-3 py-2">
            {selectedCollection && selectedCollectionContractAddress && selectedCollectionContractChainId ? (
                <>
                    <div className="mb-2 flex flex-row items-center">
                        <button
                            className="mr-2 rounded-full bg-lightBg p-2"
                            onClick={() => setSelectedCollection(null)}
                        >
                            <UndoSVG className="h-4 w-4" />
                        </button>
                        {selectedCollection.image_url ? (
                            <Image
                                className="mr-2 h-6 w-6 rounded-full object-cover"
                                src={selectedCollection.image_url ?? ''}
                                alt={selectedCollection.name}
                                width={24}
                                height={24}
                            />
                        ) : null}
                        <div className="max-w-[calc(100%-32px-24px-16px)] truncate text-base font-bold leading-5">
                            {selectedCollection.name}
                        </div>
                    </div>
                    <NFTList address={selectedCollectionContractAddress} chainId={selectedCollectionContractChainId} />
                </>
            ) : (
                <NFTCollectionList
                    address={address}
                    onClickCollection={(collection) => {
                        setSelectedCollection(collection.collection_details);
                    }}
                />
            )}
        </div>
    );
}
