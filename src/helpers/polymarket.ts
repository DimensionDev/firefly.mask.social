import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { runInSafe } from '@/helpers/runInSafe.js';
import type { PolymarketActivity } from '@/providers/types/Firefly.js';

const tailZero = /\.0+$|(\.\d*[1-9])0+$/;

export function toFixedTrimmed(num: number, fixed: number) {
    if (Number.isNaN(num)) return '0';

    const fixedNum = num.toFixed(fixed);
    return fixedNum.replace(tailZero, '$1');
}

export function formatAmount(amount: string) {
    const numStr = runInSafe(() => {
        const num = parseFloat(amount);
        return toFixedTrimmed(num / 1e6, 2);
    }, true);

    return numStr ?? '0';
}

export function computeVolume(activity: PolymarketActivity, index: number) {
    const ratio = runInSafe(
        () => {
            const total = activity.conditionOutcomePrices.reduce((acc, price) => acc + parseFloat(price), 0);
            return Math.min(parseFloat(activity.conditionOutcomePrices[index]) / total, 1);
        },
        true,
        0.5,
    ) as number;

    return nFormatter(parseFloat(activity.volume) * ratio, 2);
}
