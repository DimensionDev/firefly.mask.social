'use client';

import { useAccount } from 'wagmi';

export function ConnectWallet() {
    const account = useAccount();

    return account.address ? (
        <pre>
            {JSON.stringify(
                {
                    address: account.address,
                    isConnected: account.isConnected,
                    isDisconnected: account.isDisconnected,
                    isReconnecting: account.isReconnecting,
                    isConnecting: account.isConnecting,
                    status: account.status,
                },
                null,
                2,
            )}
        </pre>
    ) : (
        <w3m-button />
    );
}
