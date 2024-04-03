;(() => {
    'use strict';
    if (typeof AbortController === 'function' && typeof AbortSignal === 'function') {
        if (!('timeout' in AbortSignal)) {
            AbortSignal.timeout = function(ms) {
                if (typeof ms !== 'number') {
                    throw new TypeError('The timeout duration must be a number');
                }
                if (ms <= 0) {
                    throw new RangeError('The timeout duration must be a positive number');
                }

                const controller = new AbortController();
                const timer = setTimeout(() => {
                    controller.abort();
                }, ms);

                controller.signal.addEventListener('abort', () => {
                    clearTimeout(timer);
                }, { once: true });

                return controller.signal;
            };
        }
    } else {
        console.warn('AbortController or AbortSignal is not supported in this environment');
    }
})();
