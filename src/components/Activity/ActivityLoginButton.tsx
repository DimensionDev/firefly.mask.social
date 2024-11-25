'use client';

import { Trans } from '@lingui/macro';

import FarcasterIcon from '@/assets/farcaster-fill.svg';
import LensIcon from '@/assets/lens-fill.svg';
import LoadingIcon from '@/assets/loading.svg';
import TwitterIcon from '@/assets/x-fill.svg';
import { useIsLoginInActivity } from '@/components/Activity/hooks/useIsLoginInActivity.js';
import { useLoginInActivity } from '@/components/Activity/hooks/useLoginInActivity.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { useAsyncStatus } from '@/hooks/useAsyncStatus.js';

export function ActivityLoginButton({ source }: { source: SocialSource }) {
    const isLoggedIn = useIsLoginInActivity(source);
    const [{ loading }, login] = useLoginInActivity();
    const asyncStatus = useAsyncStatus(source);
    if (isLoggedIn) {
        return (
            <button className="flex h-8 items-center rounded-full border border-current px-4 font-bold leading-8 text-[13x]">
                <Trans>Connected</Trans>
            </button>
        );
    }
    const isLoading = loading || asyncStatus;
    return (
        <button
            className="relative h-8 rounded-full border border-current px-4 font-bold leading-8 text-[13x] disabled:opacity-60"
            disabled={isLoading}
            onClick={() => login(source)}
        >
            {isLoading ? (
                <span className="left-0 top-0 flex h-full w-full items-center justify-center">
                    <LoadingIcon className="animate-spin" width={16} height={16} />
                </span>
            ) : null}
            <span
                className={classNames('flex items-center', {
                    'opacity-0': isLoading,
                })}
            >
                {
                    {
                        [Source.Farcaster]: <FarcasterIcon className="mr-2 h-4 w-4 shrink-0" />,
                        [Source.Lens]: <LensIcon className="mr-2 h-4 w-4 shrink-0" />,
                        [Source.Twitter]: <TwitterIcon className="mr-2 h-4 w-4 shrink-0" />,
                    }[source]
                }
                <Trans>Sign in</Trans>
            </span>
        </button>
    );
}
