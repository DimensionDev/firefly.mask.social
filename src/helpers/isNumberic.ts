export function isNumberic(n: any): boolean {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
