try {
    if (typeof window !== 'undefined') {
        if (!window.requestIdleCallback) {
            console.info('[polyfill requestIdleCallback]: created');

            Reflect.set(window, 'requestIdleCallback', function (cb: IdleRequestCallback, options: IdleRequestOptions) {
                const start = Date.now();
                return setTimeout(function () {
                    cb({
                        didTimeout: false,
                        timeRemaining() {
                            return Math.max(0, 50 - (Date.now() - start));
                        },
                    });
                }, options?.timeout ?? 1);
            });
            Reflect.set(window, 'cancelIdleCallback', clearTimeout);
        }
    }
} catch (error) {
    console.error(`[polyfill requestIdleCallback]: ${error}`);
}
