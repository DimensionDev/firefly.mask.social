'use client';

import { Trans } from '@lingui/macro';
import urlcat from 'urlcat';

import { ActivityClaimButton } from '@/components/Activity/ActivityClaimButton.js';
import { ActivityConnectCard } from '@/components/Activity/ActivityConnectCard.js';
import { ActivityLoginButton } from '@/components/Activity/ActivityLoginButton.js';
import { ActivityPremiumConditionList } from '@/components/Activity/ActivityPremiumConditionList.js';
import { ActivityTaskFollowCard } from '@/components/Activity/ActivityTaskFollowCard.js';
import { ActivityVerifyText } from '@/components/Activity/ActivityVerifyText.js';
import { useActivityClaimCondition } from '@/components/Activity/hooks/useActivityClaimCondition.js';
import { useActivityCurrentAccountHandle } from '@/components/Activity/hooks/useActivityCurrentAccountHandle.js';
import { useIsFollowInActivity } from '@/components/Activity/hooks/useIsFollowInActivity.js';
import { Source, SourceInURL } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { CHAR_TAG, type Chars } from '@/helpers/chars.js';
import { classNames } from '@/helpers/classNames.js';
import { ReferralAccountPlatform, resolveActivityUrl } from '@/helpers/resolveActivityUrl.js';
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

export function ActivityFrensgivingTasks({
    data,
}: {
    data: Pick<Required<ActivityInfoResponse>['data'], 'status' | 'name'>;
}) {
    const farcasterHandle = useActivityCurrentAccountHandle(Source.Farcaster);
    const shareUrl = urlcat(
        SITE_URL,
        resolveActivityUrl(data.name, { referralCode: farcasterHandle, platform: ReferralAccountPlatform.Farcaster }),
    );
    const shareContent = [
        'Just earned $ANON by minting the Firefly Farcaster Frensgiving 🦃✨ collectible from ',
        fireflyMention,
        '\n\nClaim here ',
        shareUrl,
        ' \n\n#Frensgiving #Thanksgiving #Farcaster #FireflySocial',
    ];
    const { data: isFollowedFirefly } = useIsFollowInActivity(Source.Farcaster, '16823', 'fireflyapp');
    const { data: claimCondition } = useActivityClaimCondition(Source.Farcaster);

    return (
        <>
            <div className="mb-4 w-full space-y-4 px-6 py-4">
                <div className="flex w-full flex-col space-y-2">
                    <div className="flex h-8 items-center justify-between">
                        <h2 className="text-base font-semibold leading-6">
                            <Trans>Check eligibility</Trans>
                        </h2>
                        <ActivityLoginButton source={Source.Farcaster} />
                    </div>
                </div>
                <div
                    className={classNames(
                        'flex w-full flex-col space-y-2 rounded-2xl p-3 text-sm font-semibold leading-6',
                        claimCondition?.farcaster.hasThirdpartSigner ? 'bg-success/10 dark:bg-success/20' : 'bg-bg',
                    )}
                >
                    <ActivityVerifyText verified={!!claimCondition?.farcaster.hasThirdpartSigner}>
                        <Trans>
                            Available to users with Farcaster ID under 100,000 or users of select third-party Farcaster
                            apps as of our snapshot
                        </Trans>
                    </ActivityVerifyText>
                </div>
                <h2 className="text-base font-semibold leading-6">
                    <Trans>Follow & Submit</Trans>
                </h2>
                <ActivityTaskFollowCard handle="fireflyapp" source={Source.Farcaster} profileId="16823" />
                <ActivityConnectCard
                    source={Source.Farcaster}
                    label={<Trans>Submit a wallet to receive NFT and $ANON</Trans>}
                />
                <div className="flex w-full flex-col space-y-2 text-sm font-semibold leading-6">
                    <h2 className="text-base font-semibold leading-6">
                        <Trans>Eligible for Premium Collectible?</Trans>
                    </h2>
                    <ActivityPremiumConditionList
                        title={
                            <Trans>Meet any of the following to unlock a premium collectible and get more $ANON:</Trans>
                        }
                        source={Source.Farcaster}
                    />
                </div>
            </div>
            <div className="sticky bottom-0 mt-auto w-full bg-primaryBottom px-4 pt-1.5 pb-safe-or-4 sm:pb-safe-or-2">
                <ActivityClaimButton
                    status={data.status}
                    shareContent={shareContent as Chars}
                    disabled={!isFollowedFirefly}
                    source={Source.Farcaster}
                />
            </div>
        </>
    );
}
