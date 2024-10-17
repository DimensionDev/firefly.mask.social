import { Trans } from '@lingui/macro';

import LoadingIcon from '@/assets/loading.svg';
import TwitterIcon from '@/assets/x-fill.svg';
import { useIsLoginTwitterInActivity } from '@/components/Activity/hooks/useIsLoginTwitterInActivity.js';
import { useLoginInActivity } from '@/components/Activity/hooks/useLoginInActivity.js';
import { classNames } from '@/helpers/classNames.js';

export function ActivityTwitterLoginButton() {
    const { data: isLoggedIn } = useIsLoginTwitterInActivity();
    const [{ loading }, login] = useLoginInActivity();
    if (isLoggedIn) {
        return (
            <button className="flex h-8 items-center rounded-full border border-current px-4 font-bold leading-8 text-[13x]">
                <TwitterIcon className="mr-2 h-4 w-4 shrink-0" />
                <Trans>Connected</Trans>
            </button>
        );
    }
    return (
        <button
            className="relative h-8 rounded-full border border-current px-4 font-bold leading-8 text-[13x] disabled:opacity-60"
            disabled={loading}
            onClick={login}
        >
            {loading ? (
                <span className="left-0 top-0 flex h-full w-full items-center justify-center">
                    <LoadingIcon className="animate-spin" width={16} height={16} />
                </span>
            ) : null}
            <span
                className={classNames('flex items-center', {
                    'opacity-0': loading,
                })}
            >
                <TwitterIcon className="mr-2 h-4 w-4 shrink-0" />
                <Trans>Sign in</Trans>
            </span>
        </button>
    );
}
