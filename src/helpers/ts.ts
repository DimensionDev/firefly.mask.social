export function toUnix(ts: number): number {
    return ts > 10000000000 ? Math.floor(ts / 1000) : ts;
}

export function toMilliseconds(ts: number): number {
    return ts < 10000000000 ? Math.floor(ts * 1000) : ts;
}

export function isTimestamp(ts: string) {
    return ts.length === 13 && /^\d+$/.test(ts);
}

export function isUnixTimestamp(ts: string): boolean {
    return /^\d+$/.test(ts) && ts.length === 10;
}
