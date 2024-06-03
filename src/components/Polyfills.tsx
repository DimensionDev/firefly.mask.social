'use client';

import '@/polyfills/index.js';

import { Script } from '@/esm/Script.js';

export function Polyfills() {
    return (
        <>
            <Script src="/js/polyfills/object.hasown.js" />
            <Script src="/js/polyfills/dom.js" />
            <Script src="/js/polyfills/ecmascript.js" />
            <Script src="/js/polyfills/worker.js" />
        </>
    );
}
