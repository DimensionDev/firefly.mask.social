'use client';

import { Script } from '@/esm/Script.js';

export function BuildInfo() {
    return (
        <>
            <Script>
                {`
                    console.log('[Build Info]:', {
                        APP_VERSION: "${process.env.APP_VERSION}",
                        BUILD_DATE: "${process.env.BUILD_DATE}",
                        COMMIT_HASH: "${process.env.COMMIT_HASH}",
                    });
                `}
            </Script>
        </>
    );
}
