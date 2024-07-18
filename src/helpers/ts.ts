export function toUnix(ts: number): number {
    return ts > 10000000000 ? Math.floor(ts / 1000) : ts;
}

export function toMilliseconds(ts: number): number {
    return ts < 10000000000 ? Math.floor(ts * 1000) : ts;
}
