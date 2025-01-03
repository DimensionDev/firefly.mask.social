import { formatBalance } from '@/helpers/formatBalance.js';
import { multipliedBy } from '@/helpers/number.js';
import { useCoinInfo } from '@/hooks/useCoinInfo.js';

interface Props {
    value: number | string;
    symbol: string;
    decimals: number;
    target: string;
    prefix?: string;
    suffix?: string;
}

export function TokenPrice({ value, symbol, decimals, target, prefix, suffix }: Props) {
    const { data, isLoading } = useCoinInfo(symbol);
    if (isLoading || !data) return null;
    if ('error' in data) return null;
    const currentPrice = data.market_data.current_price[target];
    if (!currentPrice) return null;
    const num = multipliedBy(value, currentPrice);
    return `${prefix}${formatBalance(num.toFixed(0), decimals, {
        fixedDecimals: 2,
        isFixed: true,
    })}${suffix}`;
}
