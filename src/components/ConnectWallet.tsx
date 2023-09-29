'use client';

import { useAccount } from 'wagmi';

export function ConnectWallet() {
    const account = useAccount();

    return (
        <>
            <w3m-connect-button />
            {account.isConnected ? (
                <div className="flex mt-4">
                    <w3m-account-button />
                    <w3m-network-button />
                </div>
            ) : null}
        </>
    );
}
