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
