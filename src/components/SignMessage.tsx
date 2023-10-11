import { useState } from 'react';
import { getWalletClient } from 'wagmi/actions';

export function SignMessage() {
    const [signed, setSigned] = useState('');

    return (
        <div>
            <pre className="break-all">{signed || 'Not signed'}</pre>
            <button
                onClick={async () => {
                    const client = await getWalletClient();
                    if (!client) throw new Error('Failed to create client.');

                    console.log(client.account);
                    console.log(client.chain);

                    const signed = await client.signMessage({ message: 'Hello World!' });

                    setSigned(signed ?? '');
                }}
            >
                Sign Message
            </button>
        </div>
    );
}
