/**
 * Returns a new `AbortSignal` that will be aborted when any of the provided signals are aborted.
 * @param signals
 * @returns
 */
export function anySignal(...signals: Array<AbortSignal | null>) {
    const controller = new AbortController();

    function onAbort() {
        controller.abort();

        // Cleanup
        for (const signal of signals) {
            signal?.removeEventListener('abort', onAbort);
        }
    }

    for (const signal of signals) {
        if (signal?.aborted) {
            onAbort();
            break;
        }
        signal?.addEventListener('abort', onAbort);
    }

    return controller.signal;
}
