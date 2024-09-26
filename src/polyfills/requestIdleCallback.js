try {
    if (typeof window !== 'undefined') {
        if (!window.requestIdleCallback) {
            console.info('[polyfill requestIdleCallback]: created');

            window.requestIdleCallback = (cb, options) => {
                const start = Date.now();
                const timer = setTimeout(() => {
                    cb({
                        didTimeout: false,
                        timeRemaining() {
                            return Math.max(0, 50 - (Date.now() - start));
                        },
                    });
                }, options?.timeout ?? 1);
                return timer;
            };
            window.cancelIdleCallback = clearTimeout;
        }
    }
} catch (error) {
    console.error(`[polyfill requestIdleCallback]: ${error}`);
}
