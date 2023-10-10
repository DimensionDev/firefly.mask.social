'use client';

import { generateCustodyBearer } from "@/helpers/generateCustodyBearer";
import { useState } from "react";
import { getWalletClient } from "wagmi/actions";

export function FarcasterAuthExample() {
    const [token, setToken] = useState('')
    return (
        <div>
            <h1>Farcaster Auth Example</h1>
            <pre>Token: {token || 'Please generate a token.'}</pre>
            <button onClick={async () => {
                const client = await getWalletClient();
                if (!client) throw new Error('Failed to create client.')
                setToken(await generateCustodyBearer(client))
            }}>Generate Token</button>
        </div>
    );
}