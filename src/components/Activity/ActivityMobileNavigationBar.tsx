'use client';

import { usePathname } from 'next/navigation.js';
import { type HTMLProps, useContext } from 'react';

import NavigationBarBackIcon from '@/assets/navigation-bar-back.svg';
import ShareIcon from '@/assets/share-navbar.svg';
import { ActivityContext } from '@/components/Activity/ActivityContext.js';
import { useActivityShareUrl } from '@/components/Activity/hooks/useActivityShareUrl.js';
import { IS_ANDROID } from '@/constants/bowser.js';
import { PageRoute } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { useComeBack } from '@/hooks/useComeback.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { captureActivityEvent } from '@/providers/telemetry/captureActivityEvent.js';
import { EventId } from '@/providers/types/Telemetry.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { SupportedMethod } from '@/types/bridge.js';

interface Props extends HTMLProps<'div'> {}

export function ActivityMobileNavigationBar({ children, className }: Props) {
    const pathname = usePathname();
    const comeback = useComeBack();
    const { name } = useContext(ActivityContext);
    const shareUrl = useActivityShareUrl(name);

    return (
        <>
            <div
                className={classNames('fixed bottom-[calc(100%-44px)] left-0 z-20 h-[700px] w-full bg-primaryBottom', {
                    'dark:bg-[#181a20]': IS_ANDROID,
                })}
            />
            <div
                className={classNames(
                    'sticky top-0 z-30 grid h-[44px] w-full grid-cols-[24px_1fr_24px] items-center justify-between gap-2 bg-primaryBottom px-4 text-center text-lg font-bold',
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
                        captureActivityEvent(EventId.EVENT_SHARE_CLICK, {});
                        if (pathname === PageRoute.Events) {
                            fireflyBridgeProvider.request(SupportedMethod.SHARE, { text: window.location.href });
                            return;
                        }
                        fireflyBridgeProvider.request(SupportedMethod.SHARE, { text: shareUrl });
                    }}
                >
                    <ShareIcon width={24} height={24} />
                </button>
                <div className="absolute bottom-[100%] h-[200px] w-full bg-primaryBottom dark:bg-[#262a34]" />
            </div>
        </>
    );
}
