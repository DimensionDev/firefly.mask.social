'use client';

import { Trans } from '@lingui/macro';
import { ChainId } from '@masknet/web3-shared-evm';
import { useContext, useMemo } from 'react';
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
import { useIsFollowInActivity } from '@/components/Activity/hooks/useIsFollowInActivity.js';
import { Source } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { FIREFLY_MENTION, FIREFLY_TWITTER_PROFILE } from '@/constants/mentions.js';
import { type Chars } from '@/helpers/chars.js';
import { ReferralAccountPlatform, resolveActivityUrl } from '@/helpers/resolveActivityUrl.js';
import { ActivityElex24VoteOption } from '@/providers/types/Activity.js';
import type { ActivityInfoResponse } from '@/providers/types/Firefly.js';

export function ActivityElex24Tasks({ data }: { data: Pick<Required<ActivityInfoResponse>['data'], 'status'> }) {
    const { vote } = useContext(ActivityElex24Context);
    const { name, address } = useContext(ActivityContext);
    const xHandle = useActivityCurrentAccountHandle(Source.Twitter);
    const shareUrl = urlcat(
        SITE_URL,
        resolveActivityUrl(name, { referralCode: xHandle, platform: ReferralAccountPlatform.X }),
    );
    const { data: isFollowedFirefly } = useIsFollowInActivity(
        Source.Twitter,
        FIREFLY_TWITTER_PROFILE.platform_id,
        FIREFLY_TWITTER_PROFILE.handle,
    );
    const shareContent = vote
        ? {
              [ActivityElex24VoteOption.Trump]: [
                  'Just claimed the "Vote for Trump ❤️" collectible from ',
                  FIREFLY_MENTION,
                  ' \n\n',
                  `Be part of the movement—grab your FREE Exclusive NFT to support Former President #Trump at ${shareUrl} 🇺🇲`,
                  '\n\n #Election2024 #FireflySocial',
              ],
              [ActivityElex24VoteOption.Harris]: [
                  'Just claimed the "Vote for Harris 💙" collectible from ',
                  FIREFLY_MENTION,
                  ' \n\n',
                  `Be part of the movement—grab your FREE Exclusive NFT to support Vice President #Harris at ${shareUrl} 🇺🇲`,
                  '\n\n #Election2024 #FireflySocial',
              ],
          }[vote]
        : '';

    const claimApiExtraParams = useMemo(() => ({ vote }), [vote]);
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
                <h2 className="text-base font-semibold leading-6">
                    <Trans>Step 3 Select to vote</Trans>
                </h2>
                <ActivityElex24Vote />
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
                    claimApiExtraParams={claimApiExtraParams}
                    shareContent={shareContent as Chars}
                    claimType={vote}
                    disabled={!vote || !isFollowedFirefly}
                    source={Source.Twitter}
                />
            </div>
        </>
    );
}
