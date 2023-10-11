export function isSameAddress(address?: string | undefined, otherAddress?: string | undefined): boolean {
    if (!address || !otherAddress) return false;
    return address.toLowerCase() === otherAddress.toLowerCase();
}
