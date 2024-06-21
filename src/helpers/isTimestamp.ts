export function isTimestamp(timestamp: string) {
    return timestamp.length === 13 && /^\d+$/.test(timestamp);
}
