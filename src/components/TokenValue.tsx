import { formatCurrency, type FungibleToken } from '@masknet/web3-shared-base';
import { type ChainId, SchemaType } from '@masknet/web3-shared-evm';
import { BigNumber } from 'bignumber.js';
import { type HTMLProps, useMemo } from 'react';

import { TokenIcon } from '@/components/Tips/TokenIcon.js';
import { classNames } from '@/helpers/classNames.js';
import { formatFungibleTokenToDebankToken } from '@/helpers/formatToken.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { useFungibleTokenPrice } from '@/hooks/useFungibleTokenPrice.js';

interface Props extends HTMLProps<HTMLDivElement> {
    amount?: string;
    token?: FungibleToken<ChainId, SchemaType> | null;
    chainId?: number;
}

export function TokenValue({ className, token, amount, chainId: overrideChainId, ...rest }: Props) {
    const { chainId } = useChainContext({
        chainId: overrideChainId,
    });

    const { data: tokenPrice = 0 } = useFungibleTokenPrice(token?.address, { chainId });

    const priceUSD = useMemo(() => {
        if (!tokenPrice || !amount) return;
        return formatCurrency(new BigNumber(amount).times(tokenPrice), 'USD', { onlyRemainTwoOrZeroDecimal: true });
    }, [amount, tokenPrice]);

    return amount && token ? (
        <div className={classNames('flex flex-col gap-1', className)} {...rest}>
            <div className="flex items-center justify-center gap-x-1">
                <strong className="text-2xl font-bold">{amount}</strong>
                <TokenIcon token={formatFungibleTokenToDebankToken(token)} tokenSize={24} disableChainIcon />
            </div>
            {priceUSD ? <div className="text-sm text-gray-500">{`\u2248 ${priceUSD ?? '0'}`}</div> : null}
        </div>
    ) : null;
}
