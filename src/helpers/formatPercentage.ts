/**
 * @param value 0-1
 */
export function formatPercentage(value: number) {
    if (value < 0.0001) {
        return '< 0.01%';
    }
    return `${(value * 100).toFixed(2).replace(/\.0+$/, '')}%`;
}
