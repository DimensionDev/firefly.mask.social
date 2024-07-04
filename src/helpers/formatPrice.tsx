import { BigNumber } from 'bignumber.js';

export function formatPrice(price: number | string | undefined, digits?: number) {
    if (price === undefined) return price;
    price = +price;
    digits = digits ?? (price >= 0.01 ? 2 : 4);
    if (price < 0.0001) {
        const bn = BigNumber(price);
        return bn
            .precision(digits, BigNumber.ROUND_DOWN)
            .toFormat()
            .replace(/^0\.(0+)/, (_, zeros) => {
                return `0.0{${zeros.length}}`;
            });
    }

    return price.toLocaleString('en-US', {
        minimumFractionDigits: Math.min(2, digits),
        maximumFractionDigits: digits,
    });
}

export function renderShrankPrice(shrank: string) {
    if (!shrank.includes('{')) return shrank;
    const parts = shrank.match(/(^.+){(\d+)}(.+$)/);
    if (!parts) return shrank;
    return (
        <>
            {parts[1]}
            <sub className="text-[0.66em]">{parts[2]}</sub>
            {parts[3]}
        </>
    );
}
