'use client';

import { Trans } from '@lingui/macro';
import { useContext } from 'react';
import urlcat from 'urlcat';

import { ActivityClaimButton } from '@/components/Activity/ActivityClaimButton.js';
import { ActivityConnectCard } from '@/components/Activity/ActivityConnectCard.js';
import { ActivityContext } from '@/components/Activity/ActivityContext.js';
import { ActivityElex24Context } from '@/components/Activity/ActivityElex24/ActivityElex24Context.js';
import { ActivityElex24Vote } from '@/components/Activity/ActivityElex24/ActivityElex24Vote.js';
import { ActivityLoginButton } from '@/components/Activity/ActivityLoginButton.js';
import { ActivityPremiumConditionList } from '@/components/Activity/ActivityPremiumConditionList.js';
import { ActivityTaskFollowCard } from '@/components/Activity/ActivityTaskFollowCard.js';
import { useActivityCurrentAccountHandle } from '@/components/Activity/hooks/useActivityCurrentAccountHandle.js';
import { Source, SourceInURL } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { CHAR_TAG, type Chars } from '@/helpers/chars.js';
import { ReferralAccountPlatform, resolveActivityUrl } from '@/helpers/resolveActivityUrl.js';
import { ActivityElex24VoteOption } from '@/providers/types/Activity.js';
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
    const { name } = useContext(ActivityContext);
    const xHandle = useActivityCurrentAccountHandle(Source.Twitter);
    const shareUrl = urlcat(
        SITE_URL,
        resolveActivityUrl(name, { referralCode: xHandle, platform: ReferralAccountPlatform.X }),
    );

    const shareContent = vote
        ? {
              [ActivityElex24VoteOption.Trump]: [
                  'Just claimed the "Vote for Trump ❤️" collectible from ',
                  fireflyMention,
                  ' \n\n',
                  `Be part of the movement—grab your FREE Exclusive NFT to support Former President #Trump at ${shareUrl} 🇺🇲`,
                  '\n\n #Election2024 #FireflySocial',
              ],
              [ActivityElex24VoteOption.Harris]: [
                  'Just claimed the "Vote for Harris 💙" collectible from ',
                  fireflyMention,
                  ' \n\n',
                  `Be part of the movement—grab your FREE Exclusive NFT to support Vice President #Harris at ${shareUrl} 🇺🇲`,
                  '\n\n #Election2024 #FireflySocial',
              ],
          }[vote]
        : '';

    return (
        <>
            <div className="mb-4 w-full space-y-4 px-6 py-4">
                <div className="flex w-full flex-col space-y-2">
                    <div className="flex h-8 items-center justify-between">
                        <h2 className="text-base font-semibold leading-6">
                            <Trans>Step 1 Sign in</Trans>
                        </h2>
                        <ActivityLoginButton source={Source.Twitter} />
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
                <ActivityConnectCard source={Source.Twitter} />
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
