import { CurrencyType, formatCurrency } from '@masknet/web3-shared-base';
import { first, last } from 'lodash-es';
import type { RefObject } from 'react';

import { type Dimension,useLineChart } from '@/hooks/useLineChart.js';

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
    },
) {
    const startValue = first(data)?.value ?? 0;
    const endValue = last(data)?.value ?? 0;
    const defaultColor = endValue - startValue < 0 ? 'red' : 'green';

    const { color = defaultColor, sign = CurrencyType.USD } = opts;

    useLineChart(svgRef, data, dimension, id, {
        color,
        tickFormat: `${sign},.2s`,
        formatTooltip: (value) =>
            sign.match(/^[A-Za-z]{3,5}$/) ? formatCurrency(value, sign) : `${sign} ${value.toPrecision(6)}`,
    });
}
