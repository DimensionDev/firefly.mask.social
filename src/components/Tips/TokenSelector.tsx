import { t } from '@lingui/macro';
import { memo, useCallback } from 'react';
import { useAsync } from 'react-use';

import ArrowDown from '@/assets/arrow-down.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { SearchTipsTokenPanel } from '@/components/Search/SearchTipsTokenPanel.js';
import { TipsModalHeader } from '@/components/Tips/TipsModalHeader.js';
import { router, TipsRoutePath } from '@/components/Tips/TipsModalRouter.js';
import { TokenIcon } from '@/components/Tips/TokenIcon.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveNetworkProvider } from '@/helpers/resolveTokenTransfer.js';
import { TipsContext } from '@/hooks/useTipsContext.js';
import type { Token } from '@/providers/types/Transfer.js';

export const TokenSelector = memo(function TokenSelector() {
    const { recipient, token: selectedToken, update } = TipsContext.useContainer();

    const { value: address } = useAsync(async () => {
        if (!recipient) return;
        const network = resolveNetworkProvider(recipient?.networkType);
        return await network.getAccount();
    }, [recipient]);

    const onTokenSelected = useCallback(
        (token: Token) => {
            update((prev) => ({ ...prev, token, amount: token.id !== selectedToken?.id ? '' : prev.amount }));
            router.navigate({ to: TipsRoutePath.TIPS, replace: true });
        },
        [selectedToken?.id, update],
    );

    const isSelected = useCallback((item: Token) => item.id === selectedToken?.id, [selectedToken]);

    return (
        <>
            <TipsModalHeader back title={t`Select Token`} />
            {address ? (
                <div className="h-[50vh] md:h-[526px]">
                    <SearchTipsTokenPanel address={address} onSelected={onTokenSelected} isSelected={isSelected} />
                </div>
            ) : null}
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
