import { sortBy } from 'lodash-es';
import { useMemo } from 'react';

import { type SocialSource } from '@/constants/enum.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useProfileStore } from '@/hooks/useProfileStore.js';
import type { Account } from '@/providers/types/Account.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

function sortAccounts(accounts: Account[], profile: Profile | null) {
    return sortBy(accounts, (account) => {
        if (isSameProfile(account.profile, profile)) return -1;
        if (account.session) return 0;
        return 1;
    });
}

export function useConnectedAccounts(source: SocialSource) {
    const profile = useCurrentProfile(source);
    const { accounts } = useProfileStore(source);

    return useMemo(() => {
        return sortAccounts(accounts, profile);
    }, [profile, accounts]);
}
