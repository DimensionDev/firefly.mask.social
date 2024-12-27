import { t } from '@lingui/macro';
import { useNonFungibleCollections } from '@masknet/web3-hooks-base';
import { SchemaType } from '@masknet/web3-shared-evm';
import Fuse from 'fuse.js';
import { uniq } from 'lodash-es';
import { memo, useCallback, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { SearchContentPanel } from '@/components/Search/SearchContentPanel.js';
import { chains } from '@/configs/wagmiClient.js';
import { NetworkPluginID } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { CollectionItem } from '@/modals/NonFungibleCollectionSelectModal/CollectionItem.js';
import type { Collection } from '@/modals/NonFungibleCollectionSelectModal/types.js';

interface FungibleTokenSelectPanelProps {
    onSelected?: (selected: Collection) => void;
    isSelected?: (item: Collection) => boolean;
}

function renderCollection(collection: Collection) {
    return <CollectionItem key={collection.id} collection={collection} />;
}

export const NonFungibleCollectionSelectPanel = memo<FungibleTokenSelectPanelProps>(
    function NonFungibleCollectionSelectPanel({ onSelected, isSelected }) {
        const isMedium = useIsMedium('max');
        const [chainId, setChainId] = useState<number>();
        const account = useAccount();

        const { data: allCollections = EMPTY_LIST, isLoading } = useNonFungibleCollections(NetworkPluginID.PLUGIN_EVM, {
            schemaType: SchemaType.ERC721,
            account: account.address,
        });
        const collections = useMemo(
            () => (chainId ? allCollections.filter((x) => x.chainId === chainId) : allCollections),
            [allCollections, chainId],
        );
        const chainIds = useMemo(() => {
            return uniq(allCollections.map((collection) => collection.chainId)).filter((chainId) =>
                chains.some((x) => x.id === chainId),
            );
        }, [allCollections]);

        const getChainItem = useCallback(
            (chainId: number, isTag?: boolean) => {
                const chain = chains.find((chain) => chain.id === chainId);
                if (!chain) return null;

                return (
                    <div className="flex items-center gap-2">
                        <ChainIcon chainId={chainId} size={15} />
                        {isMedium && isTag ? null : <span>{chain.name}</span>}
                    </div>
                );
            },
            [isMedium],
        );

        const fuse = useMemo(() => {
            return new Fuse(collections, {
                keys: [
                    { name: 'name', weight: 0.5 },
                    { name: 'symbol', weight: 0.8 },
                    { name: 'address', weight: 1 },
                ],
                shouldSort: true,
                threshold: 0.45,
                minMatchCharLength: 3,
            });
        }, [collections]);

        const [keyword, setKeyword] = useState('');
        const filteredCollections = useMemo(() => {
            if (!keyword) return collections;
            return fuse
                .search(keyword)
                .filter((x) => (chainId ? x.item.chainId === chainId : true))
                .map((result) => result.item);
        }, [chainId, fuse, keyword, collections]);

        return (
            <SearchContentPanel<Collection, number>
                isLoading={isLoading}
                placeholder={t`Search by name or symbol`}
                filterProps={{
                    placeholder: t`All chains`,
                    data: chainIds,
                    popoverClassName: 'w-[150px]',
                    itemRenderer: (chainId, isTag) => getChainItem(chainId, isTag),
                    isSelected: (item, current) => item === current,
                    selected: chainId,
                    onSelected: setChainId,
                }}
                keyword={keyword}
                onSearch={setKeyword}
                data={filteredCollections}
                itemRenderer={renderCollection}
                onSelected={onSelected}
                listKey={(token) => `${token.chainId}/${token.address}`}
                isSelected={isSelected}
            />
        );
    },
);
