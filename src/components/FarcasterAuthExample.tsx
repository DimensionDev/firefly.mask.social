'use client';

import { useState } from 'react';

import { WarpcastSocialMedia } from '@/providers/warpcast/SocialMedia.js';

export function FarcasterAuthExample() {
    const [info, setInfo] = useState<unknown>();
    return (
        <div>
            {info ? (
                <>
                    <pre>Info: {JSON.stringify(info)}</pre>
                </>
            ) : null}
            <button
                onClick={async () => {
                    const warpcast = new WarpcastSocialMedia();
                    const client = await warpcast.createClient();
                    const info = await client.getHubInfo();

                    setInfo(info);
                }}
            >
                &gt; Get Current User
            </button>
            <br />
            <button
                onClick={async () => {
                    throw new Error('Not available');
                }}
            >
                &gt; Publish Cast
            </button>
        </div>
    );
}
