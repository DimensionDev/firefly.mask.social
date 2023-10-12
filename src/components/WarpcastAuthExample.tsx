'use client';

import { useState } from 'react';
import { fetchJSON } from '@/helpers/fetchJSON';

export function WarpcastAuthExample() {
    const [signed, setSigned] = useState<{ key: string; token: string }>();
    return (
        <div>
            <pre>{JSON.stringify(signed)}</pre>
            <button
                onClick={async () => {
                    const result = await fetchJSON<{
                        key: string
                        token: string
                    }>('/api/warpcast/signin', {
                        method: 'POST',
                    });

                    setSigned(result);
                }}
            >
                &gt; Sign in
            </button>
        </div>
    );
}
