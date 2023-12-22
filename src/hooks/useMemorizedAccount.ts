import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import type { GetAccountResult } from 'wagmi/actions';

const KEY = '@firefly/account';

function getMemorizedAccount() {
    return localStorage.getItem(KEY);
}
function updateMemorizedAccount(account: string) {
    return localStorage.setItem(KEY, account);
}
export function clearMemorizedAccount() {
    return localStorage.removeItem(KEY);
}

export function useMemorizedAccount() {
    const account = useAccount();
    return {
        ...account,
        address: account.address || getMemorizedAccount(),
    } as GetAccountResult;
}

export function useMemorizeAccount() {
    const account = useAccount();
    useEffect(() => {
        if (account.isConnected && account.address) {
            updateMemorizedAccount(account.address);
        }
    }, [account.isConnected, account.address]);
}
