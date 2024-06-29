export function formatNumber(num: number | string | undefined, digits = 2) {
    if (num === undefined) return num;
    return (+num).toLocaleString('en-US', {
        minimumFractionDigits: Math.min(2, digits),
        maximumFractionDigits: digits,
    });
}
