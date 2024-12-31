import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import React, { type HTMLProps, memo } from 'react';

import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { chains } from '@/configs/wagmiClient.js';
import { classNames } from '@/helpers/classNames.js';
import { formatPrice, renderShrankPrice } from '@/helpers/formatPrice.js';
import { isZero, leftShift, multipliedBy, plus } from '@/helpers/number.js';
import { EVMChainResolver } from '@/mask/index.js';
import { CoinGecko } from '@/providers/coingecko/index.js';
import type { MintMetadata } from '@/providers/types/Firefly.js';

interface MintParamsPanelProps extends HTMLProps<HTMLUListElement> {
    mintParams: MintMetadata;
    mintCount: number;
    gasFee: BigNumber.Value;
    isLoading?: boolean;
    priceLabel?: React.ReactNode;
}

function renderPrice(price: BigNumber.Value, decimals = 18, symbol?: string) {
    return (
        <>
            {renderShrankPrice(formatPrice(leftShift(price, decimals).toString()) || '-')}
            {` ${symbol}`}
        </>
    );
}

export const MintParamsPanel = memo<MintParamsPanelProps>(function MintParamsPanel({
    mintParams,
    mintCount,
    gasFee,
    isLoading = false,
    priceLabel,
    className,
}) {
    const { chainId, platformFee, gasStatus, mintPrice } = mintParams;
    const chain = chains.find((chain) => chain.id === chainId);
    const { decimals, symbol } = chain?.nativeCurrency || {};
    const isFree = gasStatus === true;

    const mintPrices = multipliedBy(mintPrice || '0', mintCount);
    const totalCost = plus(mintPrices, platformFee || '0').plus(gasFee);

    const { data: totalCostInUsd } = useQuery({
        queryKey: ['token-cost', chainId, totalCost.toString()],
        staleTime: 1000 * 60 * 1,
        queryFn: async () => {
            try {
                const nativeToken = EVMChainResolver.nativeCurrency(chainId);
                if (!nativeToken) return;

                const usdPrice = await CoinGecko.getFungibleTokenPrice(chainId, nativeToken.address);
                return formatPrice(multipliedBy(usdPrice || 0, leftShift(totalCost, nativeToken.decimals)).toString());
            } catch {
                return;
            }
        },
    });

    return (
        <ul className={classNames('flex w-full flex-col gap-3 text-base text-main', className)}>
            {chain ? (
                <li className="flex w-full items-center justify-between">
                    <span>
                        <Trans>Chain</Trans>
                    </span>
                    <span className="flex items-center gap-2">
                        <ChainIcon size={16} chainId={chainId} />
                        <span className="text-sm">{chain.name}</span>
                    </span>
                </li>
            ) : null}
            <li className="flex w-full items-center justify-between">
                <span>{priceLabel || <Trans>Mint price</Trans>}</span>
                <span className="text-lightSecond">
                    {isFree || isZero(mintPrice) ? <Trans>FREE</Trans> : renderPrice(mintPrices, decimals, symbol)}
                </span>
            </li>
            <li className="flex w-full items-center justify-between">
                <span>
                    <Trans>Platform fee</Trans>
                </span>
                <span className="text-lightSecond">{renderPrice(platformFee || '0', decimals, symbol)}</span>
            </li>
            <li className="flex w-full items-center justify-between">
                <span>
                    <Trans>Network cost</Trans>
                </span>
                <span className={classNames('text-lightSecond', isLoading ? 'h-6 w-24 animate-pulse bg-third' : '')}>
                    {isLoading ? '' : renderPrice(gasFee, decimals, symbol)}
                </span>
            </li>
            <li className="flex w-full items-center justify-between">
                <span>
                    <Trans>Total</Trans>
                </span>
                <span className="flex items-center gap-3">
                    <span
                        className={classNames('text-lightSecond', {
                            'line-through': isFree,
                            'h-6 w-24 animate-pulse bg-third': isLoading,
                        })}
                    >
                        {isLoading ? '' : renderPrice(totalCost, decimals, symbol)}
                        {totalCostInUsd && !isLoading ? `($${totalCostInUsd})` : ''}
                    </span>
                    {isFree ? (
                        <span className="rounded bg-[#E8E8FF] px-2 py-1 text-sm text-highlight">
                            <Trans>Free</Trans>
                        </span>
                    ) : null}
                </span>
            </li>
        </ul>
    );
});
