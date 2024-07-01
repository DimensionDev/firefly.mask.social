import { BigNumber } from 'bignumber.js';

export function formatNumber(num: number | string | undefined, digits = 2) {
    if (num === undefined) return num;
    num = +num;
    if (num < 0.0001) {
        const bn = BigNumber(num);
        return bn
            .precision(digits, BigNumber.ROUND_DOWN)
            .toFormat()
            .replace(/^0\.(0+)/, (_, zeros) => {
                return `0.0{${zeros.length}}`;
            });
    }

    return num.toLocaleString('en-US', {
        minimumFractionDigits: Math.min(2, digits),
        maximumFractionDigits: digits,
    });
}

export function renderAbbr(children: string) {
    if (!children.includes('{')) return children;
    const parts = children.match(/(^.+){(\d+)}(.+$)/);
    if (!parts) return children;
    return (
        <>
            {parts[1]}
            <sub className="text-[0.66em]">{parts[2]}</sub>
            {parts[3]}
        </>
    );
}
