'use client';

import { t, Trans } from '@lingui/macro';
import { type HTMLProps, type ReactNode } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import { ActivityVerifyText } from '@/components/Activity/ActivityVerifyText.js';
import { useActivityFollowProfile } from '@/components/Activity/hooks/useActivityFollowProfile.js';
import { useIsFollowInActivity } from '@/components/Activity/hooks/useIsFollowInActivity.js';
import { useIsLoginInActivity } from '@/components/Activity/hooks/useIsLoginInActivity.js';
import { useLoginInActivity } from '@/components/Activity/hooks/useLoginInActivity.js';
import { Link } from '@/components/Activity/Link.js';
import { type SocialSource } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueWarningMessage } from '@/helpers/enqueueMessage.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';

interface ButtonProps extends HTMLProps<HTMLButtonElement> {
    children: ReactNode;
    loading?: boolean;
    isLoggedIn?: boolean;
    source: SocialSource;
}

function Button({ children, loading = false, isLoggedIn, onClick, className, source }: ButtonProps) {
    const [{ loading: logging }, login] = useLoginInActivity();
    return (
        <button
            className={className}
            disabled={loading || logging}
            onClick={(event) => {
                if (isLoggedIn) {
                    onClick?.(event);
                } else {
                    event.preventDefault();
                    login(source);
                }
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

interface ActivityTaskFollowCardProps {
    source: SocialSource;
    profileId: string;
    handle: string;
}

export function ActivityTaskFollowCard({ source, profileId, handle }: ActivityTaskFollowCardProps) {
    const isLoggedIn = useIsLoginInActivity(source);
    const [{ loading: isFollowing }, follow] = useActivityFollowProfile(source, profileId, handle);
    const {
        data: isFollowedFirefly,
        refetch,
        isRefetching,
        isLoading,
    } = useIsFollowInActivity(source, profileId, handle);

    return (
        <div
            className={classNames(
                'flex min-h-[56px] w-full flex-col space-y-2 rounded-2xl p-3 text-sm font-normal leading-6 md:flex-row md:items-center md:space-y-0',
                isFollowedFirefly ? 'bg-success/10 dark:bg-success/20' : 'bg-bg',
            )}
        >
            <ActivityVerifyText verified={isFollowedFirefly}>
                <h3>
                    {isFollowedFirefly ? (
                        <Trans>
                            Followed{' '}
                            <Link className="inline text-highlight" href={resolveProfileUrl(source, profileId)}>
                                @{handle}
                            </Link>{' '}
                            on {resolveSourceName(source)}
                        </Trans>
                    ) : (
                        <Trans>
                            Follow{' '}
                            <Link className="inline text-highlight" href={resolveProfileUrl(source, profileId)}>
                                @{handle}
                            </Link>{' '}
                            on {resolveSourceName(source)}
                        </Trans>
                    )}
                </h3>
            </ActivityVerifyText>
            {!isFollowedFirefly ? (
                <div className="flex space-x-2">
                    <Button
                        className="relative inline-block whitespace-nowrap rounded-full bg-main px-4 leading-8 text-primaryBottom"
                        loading={isFollowing}
                        source={source}
                        isLoggedIn={isLoggedIn}
                        onClick={() => follow()}
                    >
                        <Trans>Follow</Trans>
                    </Button>
                    <Button
                        className="relative whitespace-nowrap rounded-full border border-current px-4 leading-[30px] disabled:opacity-60"
                        loading={isRefetching || isLoading}
                        source={source}
                        isLoggedIn={isLoggedIn}
                        onClick={async () => {
                            const { data: isFollowed } = await refetch();
                            if (!isFollowed) enqueueWarningMessage(t`Verification unsuccessful`);
                        }}
                    >
                        <Trans>Verify</Trans>
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
