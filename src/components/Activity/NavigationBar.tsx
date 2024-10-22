'use client';

import type { HTMLProps } from 'react';

import NavigationBarBackIcon from '@/assets/navigation-bar-back.svg';
import ShareIcon from '@/assets/share-navbar.svg';
import { SITE_NAME } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { useComeBack } from '@/hooks/useComeback.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { SupportedMethod } from '@/types/bridge.js';

interface Props extends HTMLProps<'div'> {}

export function NavigationBar({ children, className }: Props) {
    const comeback = useComeBack();
    return (
        <div
            className={classNames(
                'sticky top-0 z-20 grid h-[44px] w-full grid-cols-[24px_1fr_24px] items-center justify-between gap-2 bg-primaryBottom px-4 text-center text-lg font-bold dark:bg-[#262a34]',
                className,
            )}
        >
            <button
                className="h-6 w-6 cursor-pointer"
                onClick={() => {
                    if (fireflyBridgeProvider.supported) return fireflyBridgeProvider.request(SupportedMethod.BACK, {});
                    return comeback();
                }}
            >
                <NavigationBarBackIcon width={24} height={24} />
            </button>
            <p className="w-full min-w-0 truncate">{children}</p>
            <button
                className="h-6 w-6 cursor-pointer"
                onClick={() => {
                    fireflyBridgeProvider.request(SupportedMethod.SHARE, { text: SITE_NAME }); // TODO: event name
                }}
            >
                <ShareIcon width={24} height={24} />
            </button>
            <div className="absolute bottom-[100%] h-[200px] w-full bg-primaryBottom dark:bg-[#262a34]" />
        </div>
    );
}
