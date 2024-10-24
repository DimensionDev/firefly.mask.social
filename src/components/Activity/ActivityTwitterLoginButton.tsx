'use client';

import { Trans } from '@lingui/macro';

import LoadingIcon from '@/assets/loading.svg';
import TwitterIcon from '@/assets/x-fill.svg';
import { useIsLoginTwitterInActivity } from '@/components/Activity/hooks/useIsLoginTwitterInActivity.js';
import { useLoginInActivity } from '@/components/Activity/hooks/useLoginInActivity.js';
import { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { useAsyncStatus } from '@/hooks/useAsyncStatus.js';

export function ActivityTwitterLoginButton() {
    const { data: isLoggedIn } = useIsLoginTwitterInActivity();
    const [{ loading }, login] = useLoginInActivity();
    const asyncStatus = useAsyncStatus(Source.Twitter);
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
            onClick={login}
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
                <TwitterIcon className="mr-2 h-4 w-4 shrink-0" />
                <Trans>Sign in</Trans>
            </span>
        </button>
    );
}
