'use client';

import { FarcasterSocialMedia } from '@/providers/farcaster/SocialMedia';
import { useState } from 'react';

export function FarcasterAuthExample() {
    const [token, setToken] = useState('');
    return (
        <div>
            <h1>Farcaster Auth Example</h1>
            <pre>Token: {token || 'Please generate a token.'}</pre>
            <button
                onClick={async () => {
                    const farcaster = new FarcasterSocialMedia();
                    const session = await farcaster.createSession();

                    console.log(session);
                }}
            >
                Generate Token
            </button>
        </div>
    );
}
