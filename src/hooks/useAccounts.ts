import { type SocialSource } from '@/constants/enum.js';
import { useAccountsAll } from '@/hooks/useAccountsAll.js';

export function useAccounts(source: SocialSource) {
    const accounts = useAccountsAll();
    return accounts[source];
}
