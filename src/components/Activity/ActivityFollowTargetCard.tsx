'use client';

import { Trans } from '@lingui/macro';

import { ActivityVerifyText } from '@/components/Activity/ActivityVerifyText.js';
import { useActivityClaimCondition } from '@/components/Activity/hooks/useActivityClaimCondition.js';
import { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';

export function ActivityFollowTargetCard({ handle, profileId }: { handle: string; profileId: string }) {
    const { data } = useActivityClaimCondition();
    const isFollowed = data?.x?.following || data?.farcaster.valid;
    // cspell: disable-next-line
    const farcasterHandle = 'barmstrong';
    return (
        <div
            className={classNames(
                'w-full rounded-2xl p-3 text-sm font-semibold leading-6',
                isFollowed ? 'bg-success/10 dark:bg-success/20' : 'bg-bg',
            )}
        >
            <ActivityVerifyText verified={isFollowed}>
                <h3>
                    <Trans>
                        Followed{' '}
                        <Link className="inline text-highlight" href={resolveProfileUrl(Source.Twitter, profileId)}>
                            @{handle}
                        </Link>{' '}
                        on X before 9/21, or followed{' '}
                        <Link className="inline text-highlight" href={resolveProfileUrl(Source.Farcaster, '20')}>
                            @{farcasterHandle}
                        </Link>{' '}
                        on Farcaster before Oct 20, 2024
                    </Trans>
                </h3>
            </ActivityVerifyText>
        </div>
    );
}
