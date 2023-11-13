'use client';

import Script from 'next/script.js';

export function Polyfills() {
    return (
        <>
            <Script src="/js/polyfills/dom.js" />
            <Script src="/js/polyfills/ecmascript.js" />
            <Script src="/js/polyfills/worker.js" />
        </>
    );
}
