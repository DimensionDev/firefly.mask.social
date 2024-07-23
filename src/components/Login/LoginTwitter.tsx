import { Trans } from '@lingui/macro';
import { usePathname } from 'next/navigation.js';
import { signIn } from 'next-auth/react';
import { useEffectOnce } from 'react-use';
import urlcat from 'urlcat';

import LoadingIcon from '@/assets/loading.svg';
import { PageRoute } from '@/constants/enum.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';

export function LoginTwitter() {
    const pathname = usePathname();

    useEffectOnce(() => {
        signIn('twitter', {
            redirect: false,
            callbackUrl:
                pathname !== PageRoute.Profile && isRoutePathname(pathname, PageRoute.Profile)
                    ? urlcat(location.origin, '/profile?source=twitter')
                    : undefined,
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
