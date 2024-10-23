'use client';

import { Trans } from '@lingui/macro';
import { type ReactNode } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import { ActivityVerifyText } from '@/components/Activity/ActivityVerifyText.js';
import {
    useActivityFollowTwitter,
    useIsFollowTwitterInActivity,
} from '@/components/Activity/hooks/useActivityFollowTwitter.js';
import { useIsLoginTwitterInActivity } from '@/components/Activity/hooks/useIsLoginTwitterInActivity.js';
import { type ProfilePageSource } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueWarningMessage } from '@/helpers/enqueueMessage.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';

interface Props {
    source: ProfilePageSource;
    profileId: string;
    handle: string;
}

function Button({
    children,
    loading = false,
    isLoggedIn,
    onClick,
    className,
}: {
    children: ReactNode;
    loading?: boolean;
    isLoggedIn?: boolean;
    onClick?: () => void;
    className?: string;
}) {
    return (
        <button
            className={className}
            disabled={loading}
            onClick={(e) => {
                if (isLoggedIn) return onClick?.();
                e.preventDefault();
                enqueueWarningMessage(<Trans>Please sign in with X to continue</Trans>);
            }}
        >
            {loading ? (
                <span className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
                    <LoadingIcon className="animate-spin" width={16} height={16} />
                </span>
            ) : null}
            <span
                className={classNames('flex items-center', {
                    'opacity-0': loading,
                })}
            >
                {children}
            </span>
        </button>
    );
}

export function ActivityTaskFollowCard({ source, profileId, handle }: Props) {
    const { data: isLoggedIn } = useIsLoginTwitterInActivity();
    const [{ loading: isFollowingTwitter }, followTwitter] = useActivityFollowTwitter(profileId, handle);
    const { data: isFollowedFirefly, refetch, isRefetching } = useIsFollowTwitterInActivity(profileId, handle);

    return (
        <div
            className={classNames(
                'flex w-full flex-col space-y-2 rounded-2xl p-3 text-sm font-semibold leading-6 sm:flex-row sm:items-center sm:space-y-0',
                isFollowedFirefly ? 'bg-success/10 dark:bg-success/20' : 'bg-bg',
            )}
        >
            <ActivityVerifyText verified={isFollowedFirefly}>
                <h3>
                    <Trans>
                        Followed{' '}
                        <Link className="inline text-highlight" href={resolveProfileUrl(source, profileId)}>
                            @{handle}
                        </Link>{' '}
                        on {resolveSourceName(source)}
                    </Trans>
                </h3>
            </ActivityVerifyText>
            {!isFollowedFirefly ? (
                <div className="flex space-x-2">
                    <Button
                        className="relative inline-block rounded-full bg-main px-4 leading-8 text-primaryBottom"
                        loading={isFollowingTwitter}
                        isLoggedIn={isLoggedIn}
                        onClick={() => followTwitter()}
                    >
                        <Trans>Follow</Trans>
                    </Button>
                    <Button
                        className="relative rounded-full border border-current px-4 leading-[30px] disabled:opacity-60"
                        loading={isRefetching}
                        isLoggedIn={isLoggedIn}
                        onClick={() => refetch()}
                    >
                        <Trans>Verify</Trans>
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
