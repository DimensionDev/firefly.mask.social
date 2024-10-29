'use client';

import { Trans } from '@lingui/macro';
import { useContext } from 'react';

import { ActivityClaimButton } from '@/components/Activity/ActivityClaimButton.js';
import { ActivityConnectCard } from '@/components/Activity/ActivityConnectCard.js';
import {
    ActivityElex24Context,
    ActivityElex24VoteOption,
} from '@/components/Activity/ActivityElex24/ActivityElex24Context.js';
import { ActivityElex24Vote } from '@/components/Activity/ActivityElex24/ActivityElex24Vote.js';
import { ActivityPremiumConditionList } from '@/components/Activity/ActivityPremiumConditionList.js';
import { ActivityTaskFollowCard } from '@/components/Activity/ActivityTaskFollowCard.js';
import { ActivityTwitterLoginButton } from '@/components/Activity/ActivityTwitterLoginButton.js';
import { Source, SourceInURL } from '@/constants/enum.js';
import { CHAR_TAG, type Chars } from '@/helpers/chars.js';
import type { ActivityInfoResponse, Profile } from '@/providers/types/Firefly.js';

const fireflyMention = {
    tag: CHAR_TAG.MENTION,
    visible: true,
    content: `@thefireflyapp`,
    profiles: [
        {
            platform_id: '1583361564479889408',
            platform: SourceInURL.Twitter,
            handle: 'thefireflyapp',
            name: 'thefireflyapp',
            hit: true,
            score: 0,
        },
        {
            platform_id: '16823',
            platform: SourceInURL.Farcaster,
            handle: 'fireflyapp',
            name: 'Firefly App',
            hit: true,
            score: 0,
        },
        {
            platform_id: '0x01b000',
            platform: SourceInURL.Lens,
            handle: 'fireflyapp',
            name: 'fireflyapp',
            hit: true,
            score: 0,
        },
    ] as Profile[],
};

export function ActivityElex24Tasks({ data }: { data: Pick<Required<ActivityInfoResponse>['data'], 'status'> }) {
    const { vote } = useContext(ActivityElex24Context);
    const shareContent = vote
        ? {
              [ActivityElex24VoteOption.Trump]: [
                  'Just claimed the "Vote for Trump❤️" collectible from ',
                  fireflyMention,
                  ' !\n\nClaim your free special edition Firefly NFT at https://firefly.mask.social/events/elex24 and support Trump to serve another four years as President.\n\n#election2024 #FireflySocial',
              ],
              [ActivityElex24VoteOption.Harris]: [
                  'Just claimed the "Vote for Harris❤️" collectible from ',
                  fireflyMention,
                  ' !\n\nClaim your free special edition Firefly NFT at https://firefly.mask.social/events/elex24 and support Vice President Harris to serve next four years as President\n\n#election2024 #FireflySocial',
              ],
          }[vote]
        : '';

    return (
        <>
            <div className="w-full space-y-4 px-6 pt-4">
                <div className="flex w-full flex-col space-y-2">
                    <div className="flex h-8 items-center justify-between">
                        <h2 className="text-base font-semibold leading-6">
                            <Trans>Step 1 Sign in</Trans>
                        </h2>
                        <ActivityTwitterLoginButton />
                    </div>
                </div>
                <ActivityTaskFollowCard
                    handle="thefireflyapp"
                    source={Source.Twitter}
                    profileId="1583361564479889408"
                />
                <h2 className="text-base font-semibold leading-6">
                    <Trans>Step 2 Connect Wallet</Trans>
                </h2>
                <ActivityConnectCard />
                <h2 className="text-base font-semibold leading-6">
                    <Trans>Step 3 Select to vote</Trans>
                </h2>
                <ActivityElex24Vote />
                <ActivityPremiumConditionList />
            </div>
            <div className="sticky bottom-0 mt-auto w-full bg-primaryBottom px-4 pt-1.5 pb-safe-or-4 sm:pb-safe-or-2">
                <ActivityClaimButton
                    status={data.status}
                    claimApiExtraParams={{ vote }}
                    shareContent={shareContent as Chars}
                    claimType={vote}
                    disabled={!vote}
                />
            </div>
        </>
    );
}
