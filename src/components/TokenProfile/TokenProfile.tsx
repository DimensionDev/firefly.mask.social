import { t, Trans } from '@lingui/macro';
import { useRouter } from 'next/navigation.js';
import { type HTMLProps, memo, useRef } from 'react';

import PriceArrow from '@/assets/price-arrow.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Image } from '@/components/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { formatMarketCap } from '@/helpers/formatMarketCap.js';
import { formatPrice, renderShrankPrice } from '@/helpers/formatPrice.js';
import { useCoinPrice24hStats } from '@/hooks/useCoinPriceStats.js';
import { useCoinTrending } from '@/hooks/useCoinTrending.js';
import type { Dimension } from '@/hooks/useLineChart.js';
import { usePriceLineChart } from '@/hooks/usePriceLineChart.js';
import { useTokenInfo } from '@/hooks/useTokenInfo.js';
import { useTokenPrice } from '@/hooks/useTokenPrice.js';

const DIMENSION: Dimension = {
    top: 12,
    right: 0,
    bottom: 12,
    left: 0,
    width: 317,
    height: 100,
};

interface Props extends HTMLProps<HTMLDivElement> {
    symbol: string;
}

export const TokenProfile = memo<Props>(function TokenProfile({ symbol, children, ...rest }) {
    const chartRef = useRef<SVGSVGElement>(null);
    const router = useRouter();
    const { data: token } = useTokenInfo(symbol);
    const { data: price } = useTokenPrice(token?.id);
    const { data: trending } = useCoinTrending(token?.id);
    const market = trending?.market;

    const { priceStats, isPending, isUp } = useCoinPrice24hStats(token?.id);

    usePriceLineChart(chartRef, priceStats, DIMENSION, `price-chart-${symbol}`, {
        simple: true,
    });

    if (!token) return null;
    return (
        <div
            {...rest}
            className={classNames(
                'box-border flex w-[317px] flex-col gap-1.5 overflow-auto rounded-2xl border border-line px-6 py-3',
                rest.className,
            )}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <div className="flex items-center gap-2.5 overflow-auto whitespace-nowrap text-second">
                <Image
                    className="overflow-hidden rounded-full"
                    src={token.logoURL}
                    alt={token.name}
                    width={40}
                    height={40}
                />
                <strong className="text-lg font-bold uppercase text-main">{token.symbol}</strong>
                <span className="overflow-hidden text-ellipsis whitespace-nowrap font-inter text-[15px] font-bold">
                    {token.name}
                </span>
            </div>
            <div className="line-height-[22px] flex items-center gap-1 text-[15px]">
                <Trans>
                    <span className="text-secondary">Price</span>
                    <strong className="font-bold">${renderShrankPrice(formatPrice(price) ?? '-')}</strong>
                    <PriceArrow width={16} height={16} className={isUp ? 'shrink-0' : 'shrink-0 rotate-180'} />
                    {market?.price_change_percentage_24h_in_currency !== undefined ? (
                        <span className={isUp ? 'text-success' : 'text-fail'}>
                            {market.price_change_percentage_24h_in_currency.toFixed(2)}%
                        </span>
                    ) : null}
                </Trans>
            </div>
            <div className="line-height-[22px] flex items-center gap-1">
                <Trans>
                    <span className="text-[15px] text-secondary">Market Cap</span>
                    <strong className="text-[15px] font-bold">
                        {market?.market_cap !== undefined ? `$${formatMarketCap(market.market_cap)}` : '-'}
                    </strong>
                    <span className="inline-flex h-[14px] items-center rounded bg-[#8E96FF] px-1 py-0.5 text-[10px] text-white">
                        Rank #{token.rank}
                    </span>
                </Trans>
            </div>
            <div className={classNames('h-[100px] overflow-auto', isPending ? 'animate-pulse' : null)}>
                <svg ref={chartRef} width={267} height={100} viewBox="0 0 317 100" />
            </div>
            <ClickableButton
                className="flex h-8 w-full items-center justify-center rounded-full bg-main text-[15px] font-semibold text-primaryBottom transition-all hover:opacity-80"
                onClick={() => {
                    router.push(`/token/${symbol}`);
                }}
            >
                {t`Detail`}
            </ClickableButton>
        </div>
    );
});
