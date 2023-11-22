'use client';

import { fetchJSON } from '@/helpers/fetchJSON.js';
import { waitForSignedKeyRequestComplete } from '@/helpers/waitForSignedKeyRequestComplete.js';
import type { ResponseJSON } from '@/types/index.js';

export function WarpcastAuthExample() {
    return (
        <div>
            <button
                onClick={async () => {
                    const response = await fetchJSON<
                        ResponseJSON<{
                            publicKey: string;
                            privateKey: string;
                            fid: string;
                            token: string;
                            deeplinkUrl: string;
                        }>
                    >('/api/warpcast/signin', {
                        method: 'POST',
                    });

                    if (!response.success) throw new Error(response.error.message);

                    console.log('DEBUG: response');
                    console.log(response);

                    const controller = new AbortController();

                    await waitForSignedKeyRequestComplete(controller.signal)(response.data.token);

                    console.log('DEBUG: ready');
                    console.log(response);
                }}
            >
                &gt; Sign in
            </button>
        </div>
    );
}
