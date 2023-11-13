'use client';

import { useState } from 'react';
import { WarpcastSocialMedia } from '@/providers/warpcast/SocialMedia.js';
import type { User } from '@standard-crypto/farcaster-js/src/utils.js';

export function FarcasterAuthExample() {
    const [user, setUser] = useState<User>();
    return (
        <div>
            {user ? (
                <>
                    <pre>FID: {user?.fid}</pre>
                    <pre>Display Name: {user?.displayName}</pre>
                </>
            ) : null}
            <button
                onClick={async () => {
                    const warpcast = new WarpcastSocialMedia();
                    const client = await warpcast.createClient();
                    const currentUser = await client.fetchCurrentUser();

                    setUser(currentUser);
                }}
            >
                &gt; Get Current User
            </button>
            <br />
            <button
                onClick={async () => {
                    const warpcast = new WarpcastSocialMedia();
                    const client = await warpcast.createClient();

                    const cast = await client.publishCast('Hello World!');
                    console.log(cast);
                }}
            >
                &gt; Publish Cast
            </button>
        </div>
    );
}
