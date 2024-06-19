import { useMemo } from 'react';

import { type SocialSource } from '@/constants/enum.js';
import { useAccountsAll } from '@/hooks/useAccountsAll.js';

export function useProfiles(source: SocialSource) {
    const accounts = useAccountsAll();
    return useMemo(() => accounts[source].map((x) => x.profile), [accounts, source]);
}
