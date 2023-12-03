'use client';

import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme';
import dynamic from 'next/dynamic.js';
import { usePathname } from 'next/navigation.js';
import type { HTMLProps } from 'react';

// @ts-ignore
const MaskRuntime = dynamic(() => import('@/MaskRuntime/index.js'), {
    ssr: false,
});

// @ts-ignore
const DynamicCalendar = dynamic(
    () => import('@masknet/plugin-calendar').then((x) => ({ default: x.CalendarContent })),
    {
        ssr: false,
    },
);

export function CalendarWidget(props: HTMLProps<HTMLDivElement>) {
    const pathname = usePathname();
    const isSettingsPage = pathname.startsWith('/settings');

    if (isSettingsPage) return null;

    return (
        <MaskRuntime>
            <section {...props}>
                <DisableShadowRootContext.Provider value={false}>
                    <ShadowRootIsolation>
                        <DynamicCalendar />
                    </ShadowRootIsolation>
                </DisableShadowRootContext.Provider>
            </section>
        </MaskRuntime>
    );
}
