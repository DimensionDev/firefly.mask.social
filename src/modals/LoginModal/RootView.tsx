import { Trans } from '@lingui/macro';
import { Outlet, useRouter } from '@tanstack/react-router';

import { BackButton } from '@/components/BackButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { LoginModalRef } from '@/modals/controls.js';

export function RootView() {
    const isMedium = useIsMedium();
    const router = useRouter();
    const { matches, location } = router.state;

    const isMain = location.pathname === '/main';

    if (isMedium) {
        const contextTitle = [...matches].reverse().find((x) => x.context.title)?.context.title;
        const title = contextTitle ?? <Trans>Login to Firefly</Trans>;
        return (
            <div className="transform rounded-[12px] bg-primaryBottom transition-all">
                <div className="flex items-center justify-center gap-2 rounded-t-[12px] p-4">
                    {isMain ? (
                        <CloseButton
                            onClick={() => {
                                LoginModalRef.close();
                            }}
                        />
                    ) : (
                        <BackButton
                            onClick={() => {
                                // history.back() is buggy, use .replace() instead.
                                router.history.replace('/main');
                            }}
                        />
                    )}

                    <div className="shrink grow basis-0 text-center text-lg font-bold leading-snug text-main">
                        {title}
                    </div>
                    <div className="relative h-6 w-6" />
                </div>
                <Outlet />
            </div>
        );
    }

    return <Outlet />;
}
