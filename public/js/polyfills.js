try {
    if (typeof window !== 'undefined' && 'AbortSignal' in window) {
        console.info('[polyfill AbortSignal.timeout]: created');

        // https://dom.spec.whatwg.org/#dom-abortsignal-timeout
        AbortSignal.timeout =
            AbortSignal.timeout ||
            function (milliseconds) {
                const controller = new AbortController();
                const signal = controller.signal;
                const signalTimer = setTimeout(() => {
                    controller.abort(new DOMException('Signal timed out.', 'TimeoutError'));
                }, milliseconds);
                signal.addEventListener('abort', () => {
                    clearTimeout(signalTimer);
                });
                return signal;
            };
    }
} catch (error) {
    console.error(`[polyfill AbortSignal.timeout]: ${error}`);
}

if (!Object.hasOwn) {
    console.info('[polyfill Object.hasOwn]: created');

    Object.hasOwn = (obj, key) => {
        // eslint-disable-next-line prefer-object-has-own
        return Object.prototype.hasOwnProperty.call(obj, key);
    };
}

if (!URL.canParse) {
    console.info('[polyfill URL.canParse]: created');

    URL.canParse = (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };
}

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

try {
    if (typeof window !== 'undefined') {
        if (!window.localStorage) {
            console.info('[polyfill localStorage]: created');

            function createStorage() {
                const storage = new Map();
                return {
                    get length() {
                        return storage.size;
                    },
                    getItem(key) {
                        return storage.get(key);
                    },
                    setItem(key, value) {
                        return storage.set(key, value);
                    },
                    removeItem(key) {
                        return storage.delete(key);
                    },
                    key(index) {
                        return Array.from(storage.keys())[index];
                    },
                    clear() {
                        storage.clear();
                    },
                };
            }

            // for firefly android webview the localStorage is not writable
            Object.defineProperty(window, 'localStorage', {
                value: createStorage(),
                configurable: true,
                enumerable: true,
                writable: true,
            });
        }
    }
} catch (error) {
    console.error(`[polyfill localStorage]: ${error}`);
}
