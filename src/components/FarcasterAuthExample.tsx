'use client';

import { useState } from 'react';
import { FarcasterSocialMedia } from '@/providers/farcaster/SocialMedia';
import { User } from '@standard-crypto/farcaster-js';

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
                    const farcaster = new FarcasterSocialMedia();
                    const client = await farcaster.createClient();
                    const currentUser = await client.fetchCurrentUser();

                    setUser(currentUser);
                }}
            >
                &gt; Get Current User
            </button>
            <br />
            <button
                onClick={async () => {
                    const farcaster = new FarcasterSocialMedia();
                    const client = await farcaster.createClient();

                    const cast = await client.publishCast('Hello World!');
                    console.log(cast);
                }}
            >
                &gt; Publish Cast
            </button>
        </div>
    );
}
