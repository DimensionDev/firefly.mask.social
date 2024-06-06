import { Trans } from '@lingui/macro';

import ComeBack from '@/assets/comeback.svg';
import SuspendedSVG from '@/assets/suspended.svg';
import { useComeBack } from '@/hooks/useComeback.js';

export function SuspendedAccountFallback() {
    const comeback = useComeBack();
    return (
        <div className="relative flex h-screen w-full flex-col items-center justify-center">
            <div className="absolute top-0 z-40 flex w-full items-center border-b border-line bg-primaryBottom px-4 py-[18px]">
                <ComeBack width={24} height={24} className="mr-8 cursor-pointer" onClick={comeback} />
            </div>
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
