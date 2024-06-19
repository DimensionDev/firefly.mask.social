import { useMemo } from 'react';

import { type SocialSource, Source } from '@/constants/enum.js';
import type { Account } from '@/providers/types/Account.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

export function useAccounts(source: SocialSource) {
    const all = useAccountsAll();
    return all[source];
}

export function useAccountsAll() {
    const lensAccounts = useLensStateStore.use.accounts();
    const farcasterAccounts = useFarcasterStateStore.use.accounts();
    const twitterAccounts = useTwitterStateStore.use.accounts();

    return useMemo<Record<SocialSource, Account[]>>(
        () => ({
            [Source.Farcaster]: farcasterAccounts,
            [Source.Lens]: lensAccounts,
            [Source.Twitter]: twitterAccounts,
        }),
        [lensAccounts, farcasterAccounts, twitterAccounts],
    );
}
