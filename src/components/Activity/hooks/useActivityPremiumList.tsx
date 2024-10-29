import { Trans } from '@lingui/macro';
import { useContext } from 'react';

import { ActivityContext } from '@/components/Activity/ActivityContext.js';
import { useActivityElex24Involved } from '@/components/Activity/ActivityElex24/useActivityElex24Involved.js';
import { useActivityClaimCondition } from '@/components/Activity/hooks/useActivityClaimCondition.js';
import { Link } from '@/components/Activity/Link.js';
import { Level } from '@/providers/types/CZ.js';

export function useActivityPremiumList() {
    const { name } = useContext(ActivityContext);
    const { data } = useActivityClaimCondition();
    const { data: isInvolvedElex24 } = useActivityElex24Involved();

    if (name === 'elex24') {
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
                label: (
                    <span>
                        <Trans>
                            Get involved in the{' '}
                            <Link
                                href="https://polymarket.com/event/presidential-election-winner-2024?tid=1729592888743"
                                className="inline text-highlight"
                            >
                                Presidential Election Winner 2024
                            </Link>{' '}
                            on Polymarket
                        </Trans>
                    </span>
                ),
                verified: isInvolvedElex24,
            },
        ];
    }

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
