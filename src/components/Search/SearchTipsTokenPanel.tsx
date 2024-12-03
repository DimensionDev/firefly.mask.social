import { t } from '@lingui/macro';
import { uniq } from 'lodash-es';
import { memo, useCallback } from 'react';

import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { SearchContentPanel } from '@/components/Search/SearchContentPanel.js';
import { TokenItem } from '@/components/Tips/TokenItem.js';
import { chains } from '@/configs/wagmiClient.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useTipsTokens } from '@/hooks/useTipsTokens.js';
import type { Token } from '@/providers/types/Transfer.js';

interface SearchTipsTokenPanelProps {
    address: string;
    onSelected?: (selected: Token) => void;
    isSelected?: (item: Token) => boolean;
}

function getTokenItem(token: Token) {
    return <TokenItem key={token.id} token={token} />;
}

export const SearchTipsTokenPanel = memo<SearchTipsTokenPanelProps>(function SearchTipsTokenPanel({
    address,
    onSelected,
    isSelected,
}) {
    const isMedium = useIsMedium('max');
    const { tokens, isLoading } = useTipsTokens(address);
    const chainIds = uniq(tokens.map((token) => token.chainId));

    const getChainItem = useCallback(
        (chainId: number, isTag?: boolean) => {
            const chain = chains.find((chain) => chain.id === chainId);

            return (
                <div className="flex items-center gap-2">
                    {chain ? (
                        <>
                            <ChainIcon chainId={chainId} size={15} />
                            {isMedium && isTag ? null : <span>{chain.name}</span>}
                        </>
                    ) : (
                        `${chainId}`
                    )}
                </div>
            );
        },
        [isMedium],
    );

    return (
        <SearchContentPanel<Token, number>
            isLoading={isLoading}
            placeholder={t`Search by name or symbol`}
            filterProps={{
                defaultFilter: t`All chains`,
                data: chainIds,
                popoverClassName: 'w-[150px]',
                itemRenderer: (chainId, isTag) => getChainItem(chainId, isTag),
            }}
            onSearch={async (query, chainId) =>
                tokens.filter(
                    (token) =>
                        [token.name, token.symbol].some((value) => value.toLowerCase().includes(query.toLowerCase())) &&
                        (!chainId || token.chainId === chainId),
                )
            }
            itemRenderer={(token) => getTokenItem(token)}
            onSelected={onSelected}
            listKey={(token) => token.id}
            isSelected={isSelected}
        />
    );
});
