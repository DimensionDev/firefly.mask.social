import { useState } from 'react';
import { getWalletClient } from 'wagmi/actions';

export function SignMessage() {
    const [signed, setSigned] = useState('');

    return (
        <div>
            {signed ? <pre className="break-all">{signed}</pre> : null}
            <button
                onClick={async () => {
                    const client = await getWalletClient();
                    if (!client) throw new Error('Failed to create client.');

                    const signed = await client.signMessage({ message: 'Hello World!' });

                    setSigned(signed ?? '');
                }}
            >
                &gt; Sign Message
            </button>
        </div>
    );
}
