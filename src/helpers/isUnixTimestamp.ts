export function isUnixTimestamp(timestamp: string): boolean {
    return /^\d+$/.test(timestamp) && timestamp.length === 10;
}
