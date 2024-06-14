import { t, Trans } from '@lingui/macro';
import { EMPTY_LIST } from '@masknet/shared-base';
import { skipToken, useQuery } from '@tanstack/react-query';
import { type HTMLProps, memo, useMemo, useRef } from 'react';

import PriceArrow from '@/assets/price-arrow.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Image } from '@/components/Image.js';
import { classNames } from '@/helpers/classNames.js';
import type { Dimension } from '@/hooks/useLineChart.js';
import { usePriceLineChart } from '@/hooks/usePriceLineChart.js';
import { Coingecko } from '@/providers/coingecko/index.js';

interface Props extends HTMLProps<HTMLDivElement> {
    symbol: string;
}

const DEFAULT_DIMENSION: Dimension = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: 317,
    height: 100,
};

export const TokenProfile = memo<Props>(function TokenProfile({ symbol, children, ...rest }) {
    const chartRef = useRef<SVGSVGElement>(null);
    const { data: token } = useQuery({
        queryKey: ['coingecko', 'tokens'],
        queryFn: async () => {
            return Coingecko.getTokens();
        },
        staleTime: Infinity,
        gcTime: Infinity,
        select: (tokens) => {
            const sym = symbol.toLowerCase();
            console.log({ tokens });
            const token = tokens.find((x) => x.symbol === sym) || null;
            return token;
        },
    });
    const { data: price } = useQuery({
        queryKey: ['coingecko', 'coin-price', token?.id],
        queryFn: token?.id ? () => Coingecko.getTokenPrice(token.id) : skipToken,
    });

    console.log('token id', token?.id);

    const { data: priceStats } = useQuery({
        queryKey: ['coingecko', 'token-price-stats', '24h', token?.id],
        queryFn: token?.id ? () => Coingecko.getPriceStats(token.id, 1) : skipToken,
    });

    const data = useMemo(() => {
        if (!priceStats) return EMPTY_LIST;
        return priceStats.prices.map(([date, price]) => ({ date: new Date(date), value: price }));
    }, [priceStats]);

    usePriceLineChart(chartRef, data, DEFAULT_DIMENSION, `popup-price-chart-${symbol}`, { sign: 'USD' });

    if (!token) return null;
    return (
        <div
            {...rest}
            className={classNames(
                'box-border flex w-[317px] flex-col gap-1.5 overflow-auto rounded-2xl px-6 py-3 shadow-send',
                rest.className,
            )}
        >
            <div className="flex items-center gap-2.5 text-second">
                <Image src={token.logoURL} alt={token.name} width={40} height={40} />
                <strong className="text-lg font-bold text-main">{token.symbol}</strong>
                <span className="font-inter text-[15px] font-bold">{token.name}</span>
            </div>
            <div className="line-height-[22px] flex items-center gap-1">
                <Trans>
                    <span className="text-[15px] text-secondary">Price</span>
                    <strong className="text-[15px] font-bold">${price ?? '-'}</strong>
                    <PriceArrow width={16} height={16} className="color-success" />
                </Trans>
            </div>
            <div className="line-height-[22px] flex items-center gap-1">
                <Trans>
                    <span className="text-[15px] text-secondary">M.Capital</span>
                    <strong className="text-[15px] font-bold">$3B</strong>
                    <span className="inline-flex h-[14px] items-center rounded bg-[#8E96FF] px-1 py-0.5 text-[10px] text-white">
                        Rank #{token.rank}
                    </span>
                </Trans>
            </div>
            <div className="h-[100px] overflow-auto">
                <svg ref={chartRef} width={269} height={100} viewBox="0 0 317 100" />
            </div>
            <ClickableButton className="flex h-8 w-full items-center justify-center rounded-full bg-main text-[15px] font-semibold text-primaryBottom transition-all hover:opacity-80">
                {t`More Detail`}
            </ClickableButton>
        </div>
    );
});
