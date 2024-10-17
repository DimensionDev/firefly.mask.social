'use client';

import { Trans } from '@lingui/macro';

import { ActivityVerifyText } from '@/components/Activity/ActivityVerifyText.js';
import { useActivityClaimCondition } from '@/components/Activity/hooks/useActivityClaimCondition.js';
import { useIsLoginTwitterInActivity } from '@/components/Activity/hooks/useIsLoginTwitterInActivity.js';
import type { ProfilePageSource } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';

interface Props {
    source: ProfilePageSource;
    profileId: string;
    handle: string;
}

export function ActivityTaskFollowCard({ source, profileId, handle }: Props) {
    const { data: isLoggedIn } = useIsLoginTwitterInActivity();
    const { data, refetch, isRefetching } = useActivityClaimCondition();
    const isFollowedFirefly = data?.firefly?.valid; // TODO
    return (
        <div
            className={classNames(
                'flex w-full flex-col space-y-2 rounded-2xl p-3 text-sm font-semibold leading-6',
                isFollowedFirefly ? 'bg-success/10' : 'bg-bg',
            )}
        >
            <ActivityVerifyText verified={isFollowedFirefly}>
                <h3>
                    <Trans>
                        Followed @{handle} on {resolveSourceName(source)}
                    </Trans>
                </h3>
            </ActivityVerifyText>
            {!isFollowedFirefly ? (
                <div className="space-x-2">
                    <Link
                        className="inline-block rounded-full bg-main px-4 leading-8 text-primaryBottom"
                        href={resolveProfileUrl(source, profileId)}
                        data-disable-nprogress={!isLoggedIn}
                        onClick={(e) => {
                            if (isLoggedIn) return;
                            e.preventDefault();
                            enqueueErrorMessage(<Trans>Please sign in with X to continue</Trans>);
                        }}
                    >
                        <Trans>Follow</Trans>
                    </Link>
                    <button
                        disabled={isRefetching}
                        className="rounded-full border border-current px-4 leading-8 disabled:opacity-60"
                        onClick={(e) => {
                            if (isLoggedIn) return refetch();
                            e.preventDefault();
                            enqueueErrorMessage(<Trans>Please sign in with X to continue</Trans>);
                        }}
                    >
                        <Trans>Verify</Trans>
                    </button>
                </div>
            ) : null}
        </div>
    );
}
