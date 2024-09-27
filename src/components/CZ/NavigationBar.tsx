'use client';
import type { HTMLProps, ReactNode } from 'react';

import NavigationBarBackIcon from '@/assets/navigation-bar-back.svg';
import CloseButtonIcon from '@/assets/close.svg';
import ReloadButtonIcon from '@/assets/reload.svg';
import { classNames } from '@/helpers/classNames.js';
import { usePathname } from 'next/navigation.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { SupportedMethod } from '@/types/bridge.js';
import { useComeBack } from '@/hooks/useComeback.js';

interface Props extends HTMLProps<'div'> {}

export function NavigationBar({ children, className }: Props) {
    const pathname = usePathname();
    const comeback = useComeBack();
    return (
        <div
            className={classNames(
                'sticky top-0 z-20 grid h-[44px] w-full grid-cols-[24px_24px_1fr_24px_24px] items-center justify-between gap-2 bg-primaryBottom px-4 text-center text-lg font-bold dark:bg-[#262a34]',
                className,
            )}
        >
            <button
                className="h-6 w-6 cursor-pointer"
                onClick={() => {
                    if (pathname !== '/activity/cz/checklist') {
                        return fireflyBridgeProvider.request(SupportedMethod.BACK, {});
                    }
                    return comeback();
                }}
            >
                <NavigationBarBackIcon width={24} height={24} />
            </button>
            <button
                className={classNames('h-6 w-6 cursor-pointer', {
                    'pointer-events-none opacity-0': pathname === '/activity/cz',
                })}
                onClick={() => fireflyBridgeProvider.request(SupportedMethod.BACK, {})}
            >
                <CloseButtonIcon width={24} height={24} />
            </button>
            <p className="w-full min-w-0 truncate">{children}</p>
            <div />
            <button className="h-6 w-6 cursor-pointer" onClick={() => window.location.reload()}>
                <ReloadButtonIcon width={24} height={24} />
            </button>
        </div>
    );
}
