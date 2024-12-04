import { t, Trans } from '@lingui/macro';
import { uniq } from 'lodash-es';
import { memo, useCallback, useState } from 'react';

import LineArrowUp from '@/assets/line-arrow-up.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { SearchContentPanel } from '@/components/Search/SearchContentPanel.js';
import { TokenItem } from '@/components/Tips/TokenItem.js';
import { chains } from '@/configs/wagmiClient.js';
import { isGreaterThan, isLessThan } from '@/helpers/number.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useTipsTokens } from '@/hooks/useTipsTokens.js';
import type { Token } from '@/providers/types/Transfer.js';

interface SearchTokenPanelProps {
    address: string;
    onSelected?: (selected: Token) => void;
    isSelected?: (item: Token) => boolean;
}

function getTokenItem(token: Token) {
    return <TokenItem key={token.id} token={token} />;
}

export const SearchTokenPanel = memo<SearchTokenPanelProps>(function SearchTokenPanel({
    address,
    onSelected,
    isSelected,
}) {
    const [showSmall, setShowSmall] = useState(false);
    const [showMore, setShowMore] = useState(false);
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

    const onSearch = useCallback(
        async (query: string, chainId?: number) => {
            const result = tokens.filter(
                (token) =>
                    [token.name, token.symbol].some((value) => value.toLowerCase().includes(query.toLowerCase())) &&
                    (!chainId || token.chainId === chainId),
            );
            const canExpand =
                result.some((token) => isGreaterThan(token.usdValue, 1)) &&
                result.some((token) => isLessThan(token.usdValue, 1));
            setShowMore(canExpand);

            return showSmall || !canExpand ? result : result.filter((token) => isGreaterThan(token.usdValue, 1));
        },
        [tokens, showSmall],
    );

    return (
        <SearchContentPanel<Token, number, boolean>
            isLoading={isLoading}
            placeholder={t`Search by name or symbol`}
            filterProps={{
                defaultFilter: t`All chains`,
                data: chainIds,
                popoverClassName: 'w-[150px]',
                itemRenderer: (chainId, isTag) => getChainItem(chainId, isTag),
            }}
            onSearch={onSearch}
            itemRenderer={(token) => getTokenItem(token)}
            onSelected={onSelected}
            listKey={(token) => token.id}
            isSelected={isSelected}
            otherParams={showSmall}
        >
            {showMore ? (
                <ClickableButton
                    className="mt-2 flex w-full items-center justify-center gap-0.5 rounded-lg py-2 text-sm font-bold text-highlight hover:bg-lightBg"
                    onClick={() => setShowSmall((prev) => !prev)}
                >
                    <span>
                        {showSmall ? (
                            <Trans>Hide tokens with small balances</Trans>
                        ) : (
                            <Trans>Show more tokens with small balances</Trans>
                        )}
                    </span>
                    <LineArrowUp width={20} height={20} className={showSmall ? '' : 'rotate-180'} />
                </ClickableButton>
            ) : null}
        </SearchContentPanel>
    );
});
