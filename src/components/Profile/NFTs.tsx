'use client';

import { t } from '@lingui/macro';
import { ChainId } from '@masknet/web3-shared-evm';
import { useState } from 'react';

import UndoSVG from '@/assets/undo.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { NFTListByCollectionId } from '@/components/CollectionDetail/NFTListByCollectionId.js';
import { Image } from '@/components/Image.js';
import { NFTCollectionList } from '@/components/Profile/NFTCollectionList.js';
import { Tooltip } from '@/components/Tooltip.js';
import type { Collection } from '@/providers/types/Firefly.js';

export interface SelectedCollection {
    chainId: ChainId;
    collectionId: string;
    collection: Collection;
}

export function NFTs(props: { address: string }) {
    const { address } = props;
    const [selectedCollection, setSelectedCollection] = useState<SelectedCollection | null>(null);

    return (
        <div className="px-3 py-2">
            {selectedCollection ? (
                <>
                    <div className="mb-2 flex flex-row items-center">
                        <ClickableButton
                            className="mr-2 rounded-full bg-lightBg p-2"
                            onClick={() => setSelectedCollection(null)}
                        >
                            <Tooltip content={t`Back`}>
                                <UndoSVG className="h-4 w-4" />
                            </Tooltip>
                        </ClickableButton>
                        {selectedCollection.collection.collection_details.image_url ? (
                            <Image
                                className="mr-2 h-6 w-6 rounded-full object-cover"
                                src={selectedCollection.collection.collection_details.image_url ?? ''}
                                alt={selectedCollection.collection.collection_details.name}
                                width={24}
                                height={24}
                            />
                        ) : null}
                        <div className="max-w-[calc(100%-32px-24px-16px)] truncate text-base font-bold leading-5">
                            {selectedCollection.collection.collection_details.name}
                        </div>
                    </div>
                    <NFTListByCollectionId
                        collectionId={selectedCollection.collectionId}
                        owner={address}
                        chainId={selectedCollection.chainId}
                    />
                </>
            ) : (
                <NFTCollectionList
                    address={address}
                    onClickCollection={(chainId, collectionId, collection) => {
                        setSelectedCollection({ chainId, collectionId, collection });
                    }}
                />
            )}
        </div>
    );
}
