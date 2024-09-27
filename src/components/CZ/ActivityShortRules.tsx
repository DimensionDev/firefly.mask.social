'use client';

import { Trans } from '@lingui/macro';

import StarPremiumIcon from '@/assets/star-premium.svg';

export function ActivityShortRules() {
    return (
        <>
            <h3 className="flex items-center text-sm font-bold leading-[18px]">
                <StarPremiumIcon width={18} height={18} className="mr-2" />
                <Trans>Premium Eligibility Criteria</Trans>
            </h3>
            <ol className="flex flex-col space-y-3 text-xs">
                <li>
                    <Trans>Your X account holds Premium status.</Trans>
                </li>
                <li>
                    <Trans>Your BNB Chain wallet holds assets worth over $10,000.</Trans>
                </li>
                <li>
                    <Trans>Your .bnb domain is a member of the SPACE ID Premier Club.</Trans>
                </li>
            </ol>
            <p className="text-xs font-bold">
                <Trans>Event runs from September 29, 2024, 12:00 UTC to October 8, 2024, 23:59 UTC.</Trans>
            </p>
        </>
    );
}
