import { Trans } from '@lingui/macro';

import { ActivityVerifyText } from '@/components/Activity/ActivityVerifyText.js';
import { useActivityClaimCondition } from '@/components/Activity/hooks/useActivityClaimCondition.js';
import { classNames } from '@/helpers/classNames.js';

export function ActivityFollowTargetCard({ handle }: { handle: string }) {
    const { data } = useActivityClaimCondition();
    const isFollowed = data?.x?.valid; // TODO
    return (
        <div
            className={classNames(
                'w-full rounded-2xl p-3 text-sm font-semibold leading-6',
                isFollowed ? 'bg-success/10' : 'bg-bg',
            )}
        >
            <ActivityVerifyText verified={isFollowed}>
                <h3>
                    <Trans>Followed @{handle} on X before 9/21</Trans>
                </h3>
            </ActivityVerifyText>
        </div>
    );
}
