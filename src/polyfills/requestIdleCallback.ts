'use client';

window.requestIdleCallback =
    window.requestIdleCallback ||
    function (cb, options) {
        const start = Date.now();
        return setTimeout(function () {
            cb({
                didTimeout: false,
                timeRemaining() {
                    return Math.max(0, 50 - (Date.now() - start));
                },
            });
        }, options?.timeout ?? 1);
    };

window.cancelIdleCallback =
    window.cancelIdleCallback ||
    function (id) {
        clearTimeout(id);
    };
