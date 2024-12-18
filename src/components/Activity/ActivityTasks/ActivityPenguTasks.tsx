import { Trans } from '@lingui/macro';
import { ChainId } from '@masknet/web3-shared-evm';
import { ChainId as SolChainId } from '@masknet/web3-shared-solana';

import { ActivityClaimButton } from '@/components/Activity/ActivityClaimButton.js';
import { ActivityConnectCard } from '@/components/Activity/ActivityConnectCard.js';
import { ActivityLoginButton } from '@/components/Activity/ActivityLoginButton.js';
import { ActivityPremiumAddressVerifyCard } from '@/components/Activity/ActivityPremiumAddressVerifyCard.js';
import { ActivityPremiumConditionList } from '@/components/Activity/ActivityPremiumConditionList.js';
import { ActivityTaskFollowCard } from '@/components/Activity/ActivityTaskFollowCard.js';
import { ActivityVerifyText } from '@/components/Activity/ActivityVerifyText.js';
import { useActivityClaimCondition } from '@/components/Activity/hooks/useActivityClaimCondition.js';
import { useActivityPremiumList } from '@/components/Activity/hooks/useActivityPremiumList.js';
import { useActivityShareUrl } from '@/components/Activity/hooks/useActivityShareUrl.js';
import { useIsFollowInActivity } from '@/components/Activity/hooks/useIsFollowInActivity.js';
import { Link } from '@/components/Activity/Link.js';
import { FireflyPlatform, Source } from '@/constants/enum.js';
import { CHAR_TAG, type Chars } from '@/helpers/chars.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
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

export function ActivityPenguTasks({
    data,
}: {
    data: Pick<Required<ActivityInfoResponse>['data'], 'status' | 'name'>;
}) {
    const { data: claimCondition } = useActivityClaimCondition(Source.Twitter);
    const list = useActivityPremiumList(Source.Twitter);
    const isPremium = list.some((x) => x.verified);
    const followProfile = {
        handle: 'pudgypenguins',
        profileId: '1415078650039443456',
        source: Source.Twitter,
        following: claimCondition?.x?.following,
    };
    const { data: isFollowedFirefly } = useIsFollowInActivity(Source.Twitter, '1583361564479889408', 'thefireflyapp');
    const shareUrl = useActivityShareUrl(data.name);
    const shareContent = [
        "Can't wait to receive $PENGU and Holiday Skates with $PENGU 🐧✨ collectible from ",
        fireflyMention,
        ' \n\nClaim here ',
        shareUrl,
        '\n\n#PENGU #FireflySocial',
    ];

    return (
        <>
            <div className="mb-4 w-full space-y-4 px-6 py-4">
                <div className="flex w-full flex-col space-y-2">
                    <div className="flex h-8 items-center justify-between">
                        <h2 className="text-base font-semibold leading-6">
                            <Trans>Check Eligibility</Trans>
                        </h2>
                        <ActivityLoginButton source={Source.Twitter} />
                    </div>
                </div>
                <div
                    className={classNames(
                        'w-full rounded-2xl p-3 text-sm font-normal leading-6',
                        followProfile.following ? 'bg-success/10 dark:bg-success/20' : 'bg-bg',
                    )}
                >
                    <ActivityVerifyText verified={followProfile.following}>
                        <h3>
                            <Trans>
                                Followed{' '}
                                <Link
                                    className="inline text-highlight"
                                    href={resolveProfileUrl(Source.Twitter, followProfile.profileId)}
                                >
                                    @{followProfile.handle}
                                </Link>{' '}
                                on X before Dec 17, 2024
                            </Trans>
                        </h3>
                    </ActivityVerifyText>
                </div>
                <ActivityTaskFollowCard
                    handle="thefireflyapp"
                    source={Source.Twitter}
                    profileId="1583361564479889408"
                />
                <h2 className="text-base font-semibold leading-6">
                    <Trans>Connect Wallet</Trans>
                </h2>
                <ActivityConnectCard
                    chainId={SolChainId.Mainnet}
                    source={Source.Twitter}
                    label={<Trans>Submit a wallet to receive NFT and $PENGU</Trans>}
                />
                <h2 className="text-base font-semibold leading-6">
                    <Trans>Eligible for Premium Collectible?</Trans>
                </h2>
                <ActivityPremiumAddressVerifyCard
                    chainId={ChainId.Mainnet}
                    source={Source.Twitter}
                    label={<Trans>Submit an evm wallet to check</Trans>}
                />
                <div className="flex w-full flex-col space-y-2 text-sm font-semibold leading-6">
                    <ActivityPremiumConditionList
                        title={
                            <Trans>
                                Meet any of the following to unlock a premium collectible and get more $PENGU:
                            </Trans>
                        }
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
