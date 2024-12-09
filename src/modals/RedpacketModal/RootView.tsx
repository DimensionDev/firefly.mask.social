import { Trans } from '@lingui/macro';
import { Outlet, useRouter, useRouterState } from '@tanstack/react-router';

import HistoryIcon from '@/assets/history.svg';
import { BackButton } from '@/components/BackButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { RedpacketModalRef } from '@/modals/controls.js';

export function RootView() {
    const router = useRouter();
    const { matches, location } = useRouterState();

    const isMain = location.pathname === '/main';

    const contextTitle = [...matches].find((x) => x.context.title)?.context.title;

    const title = contextTitle ?? <Trans>Lucky Drop</Trans>;

    return (
        <div className="flex min-h-[620px] min-w-[600px] transform flex-col rounded-[12px] bg-primaryBottom transition-all">
            <div className="flex items-center justify-center gap-2 rounded-t-[12px] p-4">
                {isMain ? (
                    <CloseButton
                        onClick={() => {
                            RedpacketModalRef.close();
                        }}
                    />
                ) : (
                    <BackButton
                        onClick={() => {
                            router.history.back();
                        }}
                    />
                )}

                <div className="shrink grow basis-0 text-center text-lg font-bold leading-snug text-main">{title}</div>
                <div className="relative h-6 w-6">
                    {isMain ? (
                        <HistoryIcon className="cursor-pointer" onClick={() => router.history.push('/history')} />
                    ) : null}
                </div>
            </div>
            <Outlet />
        </div>
    );
}
