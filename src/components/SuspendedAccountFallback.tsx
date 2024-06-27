import { Trans } from '@lingui/macro';

import SuspendedSVG from '@/assets/suspended.svg';

export function SuspendedAccountFallback() {
    return (
        <div className="relative flex h-screen w-full flex-col items-center justify-start pt-10">
            <div className="flex w-full flex-col items-center justify-center space-y-10 px-4 text-center">
                <SuspendedSVG className="h-auto w-full max-w-[310px] text-third" />
                <h3 className="text-lg font-bold text-second">
                    <Trans>Suspended</Trans>
                </h3>
                <p className="text-base text-second">
                    <Trans>The content of this account is currently unavailable</Trans>
                </p>
            </div>
        </div>
    );
}
