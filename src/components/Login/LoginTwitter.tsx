import { Trans } from '@lingui/macro';
import { signIn } from 'next-auth/react';
import { useEffectOnce } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';

export function LoginTwitter() {
    useEffectOnce(() => {
        signIn('twitter', {
            redirect: false,
        });
    });

    return (
        <div className="flex min-h-[200px] w-full flex-col items-center justify-center gap-4 p-4">
            <LoadingIcon className="animate-spin" width={24} height={24} />
            <div className="mt-2 text-center text-sm leading-[16px] text-lightSecond">
                <Trans>Please confirm the login with X.</Trans>
            </div>
        </div>
    );
}
