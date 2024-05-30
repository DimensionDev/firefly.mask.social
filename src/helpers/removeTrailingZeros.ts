export function removeTrailingZeros(str: string) {
    return str.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
}
