import { t } from '@lingui/macro';
import { isSameAddress } from '@masknet/web3-shared-base';
import { findIndex } from 'lodash-es';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from 'usehooks-ts';

import ArrowDown from '@/assets/arrow-down.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Loading } from '@/components/Loading.js';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { SearchInput } from '@/components/Search/SearchInput.js';
import { TipsModalHeader } from '@/components/Tips/TipsModalHeader.js';
import { router, TipsRoutePath } from '@/components/Tips/tipsModalRouter.js';
import { TokenIcon } from '@/components/Tips/TokenIcon.js';
import { TokenItem } from '@/components/Tips/TokenItem.js';
import { classNames } from '@/helpers/classNames.js';
import { TipsContext } from '@/hooks/useTipsContext.js';
import { useTipsTokens } from '@/hooks/useTipsTokens.js';

export const TokenSelector = memo(function TokenSelector() {
    const [search, setSearch] = useState('');
    const listRef = useRef<HTMLDivElement>(null);
    const { tokens, isLoading } = useTipsTokens();
    const { token } = TipsContext.useContainer();

    const debouncedSearch = useDebounce(search, 300);

    useEffect(() => {
        const index = findIndex(tokens, (t) => isSameAddress(t.id, token?.id));
        if (index >= 0 && listRef.current) {
            const selectedEl = listRef.current.children[index];
            selectedEl?.scrollIntoView({ block: 'center' });
        }
    }, [tokens, token?.id]);

    const filteredTokens = useMemo(() => {
        return tokens?.filter((token) => {
            return [token.name, token.symbol].some((value) =>
                value.toLowerCase().includes(debouncedSearch.toLowerCase()),
            );
        });
    }, [tokens, debouncedSearch]);

    return (
        <>
            <TipsModalHeader back title={t`Select Token`} />
            {isLoading ? (
                <Loading className="!min-h-[320px]" />
            ) : (
                <div>
                    <div className="rounded-lg !bg-lightBg">
                        <SearchInput
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onClear={() => setSearch('')}
                        />
                    </div>
                    <div className="h-80 overflow-y-auto" ref={listRef}>
                        {filteredTokens?.map((token) => <TokenItem key={`${token.id}.${token.chain}`} token={token} />)}
                        {!filteredTokens?.length && !isLoading && (
                            <NoResultsFallback message={t`No available token.`} />
                        )}
                    </div>
                </div>
            )}
        </>
    );
});

interface TokenSelectorEntryProps {
    disabled?: boolean;
}

export const TokenSelectorEntry = memo(function TokenSelectorEntry({ disabled = false }: TokenSelectorEntryProps) {
    const { token } = TipsContext.useContainer();

    return (
        <ClickableButton
            className="flex h-10 w-[calc((100%_-_12px)_/_2)] cursor-pointer items-center justify-between rounded-2xl bg-lightBg px-3"
            disabled={disabled}
            onClick={() => {
                router.navigate({ to: TipsRoutePath.SELECT_TOKEN });
            }}
        >
            <span className="shrink-0">{token ? <TokenIcon token={token} tokenSize={24} chainSize={10} /> : null}</span>
            <span
                className={classNames(
                    'truncate text-center',
                    !token ? 'text-lightSecond' : '',
                    token ? 'w-[calc(100%_-_48px)]' : 'w-[calc(100%_-_24px)]',
                )}
            >
                {token ? token.symbol : t`Select token`}
            </span>
            <ArrowDown className="shrink-0 text-lightSecond" width={24} height={24} />
        </ClickableButton>
    );
});
