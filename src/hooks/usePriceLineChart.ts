import { CurrencyType } from '@masknet/web3-shared-base';
import { first, last } from 'lodash-es';
import { type RefObject, useCallback } from 'react';

import { formatPrice } from '@/helpers/formatPrice.js';
import { type Dimension, useLineChart } from '@/hooks/useLineChart.js';

export function usePriceLineChart(
    svgRef: RefObject<SVGSVGElement>,
    data: Array<{
        date: Date;
        value: number;
    }>,
    dimension: Dimension,
    id: string,
    opts: {
        color?: string;
        sign?: string;
        simple?: boolean;
    } = {},
) {
    const startValue = first(data)?.value ?? 0;
    const endValue = last(data)?.value ?? 0;
    const defaultColor = endValue > startValue ? 'var(--color-success)' : 'var(--color-fail)';

    const { color = defaultColor, sign = CurrencyType.USD } = opts;

    const formatTooltip = useCallback((value: number) => `$${formatPrice(value)}`, []);
    useLineChart(svgRef, data, dimension, id, {
        color,
        tickFormat: `${sign},.2s`,
        formatTooltip,
        simple: opts.simple,
    });
}
