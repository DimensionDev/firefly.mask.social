'use client';

import { Trans } from '@lingui/macro';
import { useContext } from 'react';

import { ActivityClaimButton } from '@/components/Activity/ActivityClaimButton.js';
import { ActivityConnectCard } from '@/components/Activity/ActivityConnectCard.js';
import { ActivityContext } from '@/components/Activity/ActivityContext.js';
import { ActivityFollowTargetCard } from '@/components/Activity/ActivityFollowTargetCard.js';
import { ActivityLoginButton } from '@/components/Activity/ActivityLoginButton.js';
import { ActivityPremiumConditionList } from '@/components/Activity/ActivityPremiumConditionList.js';
import { ActivityTaskFollowCard } from '@/components/Activity/ActivityTaskFollowCard.js';
import { useActivityPremiumList } from '@/components/Activity/hooks/useActivityPremiumList.js';
import { useIsFollowInActivity } from '@/components/Activity/hooks/useIsFollowInActivity.js';
import { FireflyPlatform, Source, SourceInURL } from '@/constants/enum.js';
import { CHAR_TAG, type Chars } from '@/helpers/chars.js';
import type { ActivityInfoResponse, Profile } from '@/providers/types/Firefly.js';

const fireflyMention = {
    tag: CHAR_TAG.MENTION,
    visible: true,
    content: `@thefireflyapp`,
    profiles: [
        {
            platform_id: '1583361564479889408',
            platform: FireflyPlatform.Twitter,
            handle: 'thefireflyapp',
            name: 'thefireflyapp',
            hit: true,
            score: 0,
        },
        {
            platform_id: '16823',
            platform: FireflyPlatform.Farcaster,
            handle: 'fireflyapp',
            name: 'Firefly App',
            hit: true,
            score: 0,
        },
        {
            platform_id: '0x01b000',
            platform: FireflyPlatform.Lens,
            handle: 'fireflyapp',
            name: 'fireflyapp',
            hit: true,
            score: 0,
        },
    ] as Profile[],
};

// cspell: disable-next-line
const barmstrongMention = {
    tag: CHAR_TAG.MENTION,
    visible: true,
    content: '@brian_armstrong',
    profiles: [
        {
            platform_id: '0x01d86b',
            platform: SourceInURL.Lens,
            handle: 'brian',
            name: 'brian',
            namespace: 'lens',
            hit: false,
            score: 0,
        },
        {
            platform_id: '20',
            platform: SourceInURL.Farcaster,
            // cspell: disable-next-line
            handle: 'barmstrong',
            name: 'Brian Armstrong',
            namespace: '',
            hit: false,
            score: 0,
        },
        {
            platform_id: '14379660',
            platform: SourceInURL.Twitter,
            handle: 'brian_armstrong',
            name: 'brian_armstrong',
            namespace: '',
            hit: true,
            score: 0.062500186,
        },
    ],
};

export function ActivityHlblTasks({ data }: { data: Pick<Required<ActivityInfoResponse>['data'], 'status'> }) {
    const list = useActivityPremiumList(Source.Twitter);
    const isPremium = list.some((x) => x.verified);
    const shareContent = !isPremium
        ? [
              'Just claimed the "Congrats 🥂 to Brian" collectible from ',
              fireflyMention,
              ' !\n\n',
              'If you followed ',
              // cspell: disable-next-line
              barmstrongMention,
              " on X or Farcaster before Oct 20, you're eligible to claim yours at https://firefly.mask.social/event/hlbl .\n\n",
              '#Base #FireflySocial',
          ]
        : [
              'Just claimed the "Huge Congrats🍾 to Brian" collectible from ',
              fireflyMention,
              ' !\n\n',
              'If you followed ',
              // cspell: disable-next-line
              barmstrongMention,
              ' on X or Farcaster before Oct 20, you’re eligible to claim yours at https://firefly.mask.social/event/hlbl .\n\n',
              '#Base #FireflySocial',
          ];
    const { address } = useContext(ActivityContext);
    const { data: isFollowedFirefly } = useIsFollowInActivity(Source.Twitter, '1583361564479889408', 'thefireflyapp');

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
                    <ActivityFollowTargetCard handle="brian_armstrong" profileId="14379660" />
                </div>
                <ActivityTaskFollowCard
                    handle="thefireflyapp"
                    source={Source.Twitter}
                    profileId="1583361564479889408"
                />
                <h2 className="text-base font-semibold leading-6">
                    <Trans>Step 2 Connect Wallet</Trans>
                </h2>
                <ActivityConnectCard
                    source={Source.Twitter}
                    label={
                        address ? (
                            <Trans>Submit claimed address</Trans>
                        ) : (
                            <Trans>Connect your wallet to claim your NFT</Trans>
                        )
                    }
                />
                <div className="flex w-full flex-col space-y-2 text-sm font-semibold leading-6">
                    <h2 className="text-base font-semibold leading-6">
                        <Trans>Final Step Claim Now!</Trans>
                    </h2>
                    <ActivityPremiumConditionList
                        title={<Trans>Hold on! Meet any of the following to unlock a premium collectible:</Trans>}
                        source={Source.Twitter}
                    />
                </div>
            </div>
            <div className="sticky bottom-0 mt-auto w-full bg-primaryBottom px-4 pt-1.5 pb-safe-or-4 sm:pb-safe-or-2">
                <ActivityClaimButton
                    status={data.status}
                    shareContent={shareContent as Chars}
                    claimType={isPremium ? 'premium' : 'base'}
                    disabled={!isFollowedFirefly}
                    source={Source.Twitter}
                />
            </div>
        </>
    );
}
