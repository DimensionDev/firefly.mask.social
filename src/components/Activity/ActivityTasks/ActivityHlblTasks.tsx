'use client';

import { Trans } from '@lingui/macro';
import { ChainId } from '@masknet/web3-shared-evm';
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
import { Source } from '@/constants/enum.js';
import {
    BARMSTRONG_MENTION,
    BRIAN_FARCASTER_PROFILE,
    FIREFLY_MENTION,
    FIREFLY_TWITTER_PROFILE,
} from '@/constants/mentions.js';
import { type Chars } from '@/helpers/chars.js';
import type { ActivityInfoResponse } from '@/providers/types/Firefly.js';

export function ActivityHlblTasks({ data }: { data: Pick<Required<ActivityInfoResponse>['data'], 'status'> }) {
    const list = useActivityPremiumList(Source.Twitter);
    const isPremium = list.some((x) => x.verified);
    const shareContent = !isPremium
        ? [
              'Just claimed the "Congrats 🥂 to Brian" collectible from ',
              FIREFLY_MENTION,
              ' !\n\n',
              'If you followed ',
              // cspell: disable-next-line
              BARMSTRONG_MENTION,
              " on X or Farcaster before Oct 20, you're eligible to claim yours at https://firefly.mask.social/event/hlbl .\n\n",
              '#Base #FireflySocial',
          ]
        : [
              'Just claimed the "Huge Congrats🍾 to Brian" collectible from ',
              FIREFLY_MENTION,
              ' !\n\n',
              'If you followed ',
              // cspell: disable-next-line
              BARMSTRONG_MENTION,
              ' on X or Farcaster before Oct 20, you’re eligible to claim yours at https://firefly.mask.social/event/hlbl .\n\n',
              '#Base #FireflySocial',
          ];
    const { address } = useContext(ActivityContext);
    const { data: isFollowedFirefly } = useIsFollowInActivity(
        Source.Twitter,
        FIREFLY_TWITTER_PROFILE.platform_id,
        FIREFLY_TWITTER_PROFILE.handle,
    );

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
                    <ActivityFollowTargetCard
                        handle={BRIAN_FARCASTER_PROFILE.handle}
                        profileId={BRIAN_FARCASTER_PROFILE.platform_id}
                    />
                </div>
                <ActivityTaskFollowCard
                    source={Source.Twitter}
                    handle={FIREFLY_TWITTER_PROFILE.handle}
                    profileId={FIREFLY_TWITTER_PROFILE.platform_id}
                />
                <h2 className="text-base font-semibold leading-6">
                    <Trans>Step 2 Connect Wallet</Trans>
                </h2>
                <ActivityConnectCard
                    source={Source.Twitter}
                    chainId={ChainId.Base}
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
