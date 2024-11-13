'use client';

import { t, Trans } from '@lingui/macro';
import { first } from 'lodash-es';
import { useRef, useState } from 'react';

import PriceArrow from '@/assets/price-arrow.svg';
import SwapIcon from '@/assets/swap.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Image } from '@/components/Image.js';
import { SwapModal } from '@/components/SwapModal/index.js';
import { TokenSecurityBar } from '@/components/TokenProfile/TokenSecurityBar.js';
import { useTradeInfo } from '@/components/TokenProfile/useTradeInfo.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { formatPrice, renderShrankPrice } from '@/helpers/formatPrice.js';
import { resolveTokenPageUrl } from '@/helpers/resolveTokenPageUrl.js';
import { useCoinPrice24hStats, useCoinPriceStats } from '@/hooks/useCoinPriceStats.js';
import { useCoinTrending } from '@/hooks/useCoinTrending.js';
import type { Dimension } from '@/hooks/useLineChart.js';
import { usePriceLineChart } from '@/hooks/usePriceLineChart.js';
import { useTokenPrice } from '@/hooks/useTokenPrice.js';
import { useTokenSecurity } from '@/hooks/useTokenSecurity.js';
import type { CoingeckoToken } from '@/providers/types/Coingecko.js';

interface TokenMarketDataProps {
    token: CoingeckoToken;
    linkable?: boolean;
}

const dimension: Dimension = {
    top: 32,
    right: 32,
    bottom: 32,
    left: 32,
    width: 543,
    height: 175,
};

export function TokenMarketData({ linkable, token }: TokenMarketDataProps) {
    const chartRef = useRef<SVGSVGElement>(null);
    const { data: price } = useTokenPrice(token.id);
    const { data: trending } = useCoinTrending(token.id);
    const { market, contracts } = trending ?? {};
    const contract = first(contracts);
    const { data: security } = useTokenSecurity(contract?.chainId, contract?.address);
    const [openTrader, setOpenTrader] = useState(false);
    const tradeInfo = useTradeInfo(token);

    const ranges = [
        { label: t`24h`, days: 1 },
        { label: t`7d`, days: 7 },
        { label: t`1m`, days: 30 },
        { label: t`1y`, days: 365 },
        { label: t`Max`, days: undefined },
    ] as const;

    const [days, setDays] = useState<number | undefined>(ranges[0].days);
    const { data: priceStats = EMPTY_LIST, isPending } = useCoinPriceStats(token.id, days);
    const { isUp } = useCoinPrice24hStats(token.id);

    const baseInfo = (
        <>
            <Image
                className="overflow-hidden rounded-full"
                src={token.logoURL}
                alt={token.name}
                width={24}
                height={24}
            />
            <strong className="ml-0.5 text-medium font-bold text-main">{token.name}</strong>
            <span className="font-inter text-medium font-bold uppercase">{token.symbol}</span>
        </>
    );

    usePriceLineChart(chartRef, priceStats, dimension, `price-chart-${token.symbol}`);

    return (
        <>
            <div className="flex items-start">
                <div className="flex flex-grow flex-col gap-1.5">
                    <div className="flex items-center gap-1 text-second">
                        {linkable ? (
                            <Link prefetch className="contents" href={resolveTokenPageUrl(token.symbol)}>
                                {baseInfo}
                            </Link>
                        ) : (
                            baseInfo
                        )}
                        <span className="inline-flex h-[14px] items-center rounded bg-[#8E96FF] px-1 py-0.5 text-[10px] text-white">
                            <Trans>Rank #{token.rank}</Trans>
                        </span>
                    </div>
                    <div className="line-height-[22px] flex items-center gap-1">
                        <strong className="text-2xl font-bold">${renderShrankPrice(formatPrice(price) ?? '-')}</strong>
                        <PriceArrow
                            width={20}
                            height={20}
                            className={classNames(isUp ? 'text-success' : 'rotate-180 text-fail')}
                        />
                        {market?.price_change_percentage_24h_in_currency !== undefined ? (
                            <span className={isUp ? 'text-medium text-success' : 'text-medium text-fail'}>
                                {market.price_change_percentage_24h_in_currency.toFixed(2)}%
                            </span>
                        ) : null}
                    </div>
                    <TokenSecurityBar security={security} />
                </div>
                <ClickableButton
                    className="ml-auto inline-flex gap-[10px] rounded-full bg-main px-5 py-2 text-[15px] leading-4 text-primaryBottom"
                    disabled={!tradeInfo.tradable}
                    onClick={() => {
                        setOpenTrader(true);
                    }}
                >
                    <SwapIcon width={16} height={16} />
                    {t`Swap`}
                </ClickableButton>
            </div>
            <div
                className={classNames(
                    'flex h-[175px] items-center justify-center overflow-auto',
                    isPending ? 'animate-pulse' : null,
                )}
            >
                {isPending ? (
                    <div className="mx-2 h-40 flex-grow rounded-lg bg-gray-100 dark:bg-gray-800" />
                ) : (
                    <svg ref={chartRef} width="100%" height={175} viewBox="0 0 543 175" />
                )}
            </div>

            <div className="mt-4 flex gap-2.5 rounded-[28px] border border-line bg-input p-1 dark:bg-white/20">
                {ranges.map((range) => (
                    <ClickableButton
                        className={classNames(
                            'box-border block h-[34px] flex-grow px-3 py-2 text-sm text-main',
                            days === range.days
                                ? 'rounded-[18px] bg-primaryBottom font-bold shadow-[0px_2px_5px_1px_rgba(24,24,24,0.05)]'
                                : 'bg-transparent',
                        )}
                        key={range.label}
                        onClick={() => setDays(range.days)}
                    >
                        {range.label}
                    </ClickableButton>
                ))}
            </div>
            {openTrader && tradeInfo.tradable ? (
                <SwapModal
                    open
                    chainId={tradeInfo.chainId!}
                    address={tradeInfo.address!}
                    onClose={() => {
                        setOpenTrader(false);
                    }}
                />
            ) : null}
        </>
    );
}
