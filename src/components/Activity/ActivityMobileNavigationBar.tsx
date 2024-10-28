'use client';

import type { PropsWithChildren } from 'react';

import { ActivityDesktopNavigationBar } from '@/components/Activity/ActivityDesktopNavigationBar.js';
import { ActivityMobileNavigationBar } from '@/components/Activity/ActivityMobileNavigationBar.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';

<<<<<<<< HEAD:src/components/Activity/ActivityMobileNavigationBar.tsx
interface Props extends HTMLProps<'div'> {}

export function ActivityMobileNavigationBar({ children, className }: Props) {
    const comeback = useComeBack();
    const { fireflyAccountId } = useContext(ActivityContext);
    const pathname = usePathname();
    return (
        <div
            className={classNames(
                'sticky top-0 z-20 grid h-[44px] w-full grid-cols-[24px_1fr_24px] items-center justify-between gap-2 bg-primaryBottom px-4 text-center text-lg font-bold',
                className,
                {
                    'dark:bg-[#181a20]': IS_ANDROID,
                },
            )}
        >
            <div
                className={classNames('absolute bottom-full left-0 h-[500px] w-full bg-primaryBottom', {
                    'dark:bg-[#181a20]': IS_ANDROID,
                })}
            />
            <button
                className="h-6 w-6 cursor-pointer"
                onClick={() => {
                    if (pathname !== PageRoute.Events && useGlobalState.getState().routeChanged) {
                        comeback();
                        return;
                    }
                    if (fireflyBridgeProvider.supported) fireflyBridgeProvider.request(SupportedMethod.BACK, {});
                    else comeback();
                }}
            >
                <NavigationBarBackIcon width={24} height={24} />
            </button>
            <p className="w-full min-w-0 truncate">{children}</p>
            <button
                className="h-6 w-6 cursor-pointer"
                onClick={() => {
                    captureActivityEvent(EventId.EVENT_SHARE_CLICK, {
                        firefly_account_id: fireflyAccountId,
                    });
                    fireflyBridgeProvider.request(SupportedMethod.SHARE, { text: window.location.href });
                }}
            >
                <ShareIcon width={24} height={24} />
            </button>
            <div className="absolute bottom-[100%] h-[200px] w-full bg-primaryBottom dark:bg-[#262a34]" />
        </div>
    );
========
export function ActivityNavigationBar({ children }: PropsWithChildren) {
    if (fireflyBridgeProvider.supported) {
        return <ActivityMobileNavigationBar>{children}</ActivityMobileNavigationBar>;
    }
    return <ActivityDesktopNavigationBar>{children}</ActivityDesktopNavigationBar>;
>>>>>>>> 4d75c2b8 (refactor: activity route and component (#2968)):src/components/Activity/ActivityNavigationBar.tsx
}
