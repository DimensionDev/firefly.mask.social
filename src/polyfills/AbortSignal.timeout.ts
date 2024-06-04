try {
    if ('AbortSignal' in window) {
        // https://dom.spec.whatwg.org/#dom-abortsignal-timeout
        AbortSignal.timeout =
            AbortSignal.timeout ||
            function (milliseconds: number) {
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
} catch {}
