import { Trans } from '@lingui/macro';

import { useActivityClaimCondition } from '@/components/Activity/hooks/useActivityClaimCondition.js';
import { Level } from '@/providers/types/CZ.js';

export function useActivityPremiumList() {
    const { data } = useActivityClaimCondition();
    return [
        {
            label: <Trans>Your X account holds Premium status</Trans>,
            verified: data?.x?.level === Level.Lv2,
        },
        {
            label: <Trans>Your Farcaster account holds Power Badge</Trans>,
            verified: data?.farcaster.isPowerUser,
        },
        {
            label: <Trans>Your assets on Base Chain are worth over US$10,000</Trans>,
            verified: data?.balance?.level === Level.Lv2,
        },
    ];
}
