'use client';

import { Script } from '@/esm/Script.js';

export function BuildInfo() {
    return (
        <>
            <Script>
                {`
                    console.log('[Build Info]:', JSON.stringify({
                        APP_VERSION: "${process.env.APP_VERSION}",
                        COMMIT_HASH: "${process.env.COMMIT_HASH}",
                    }));
                `}
            </Script>
        </>
    );
}
