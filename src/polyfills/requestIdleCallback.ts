try {
    if (typeof window !== 'undefined') {
        if (!window.requestIdleCallback) {
            console.info('[polyfill requestIdleCallback]: created');

            window.requestIdleCallback = (cb: IdleRequestCallback, options?: IdleRequestOptions) => {
                const start = Date.now();
                const timer = setTimeout(() => {
                    cb({
                        didTimeout: false,
                        timeRemaining() {
                            return Math.max(0, 50 - (Date.now() - start));
                        },
                    });
                }, options?.timeout ?? 1);
                return timer as unknown as number;
            };
            window.cancelIdleCallback = clearTimeout;
        }
    }
} catch (error) {
    console.error(`[polyfill requestIdleCallback]: ${error}`);
}
