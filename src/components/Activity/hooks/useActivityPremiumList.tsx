import { Trans } from '@lingui/macro';

import { useActivityClaimCondition } from '@/components/Activity/hooks/useActivityClaimCondition.js';
import { Level } from '@/providers/types/CZ.js';

export function useActivityPremiumList() {
    const { data } = useActivityClaimCondition(); // TODO
    return [
        {
            label: <Trans>X Premium account</Trans>,
            verified: data?.x?.level === Level.Lv2,
        },
        {
            label: <Trans>Hold ≥ $10k Base Chain asset</Trans>,
            verified: data?.bnbId?.level === Level.Lv2, // TODO: Base Chain assets
        },
    ];
}
