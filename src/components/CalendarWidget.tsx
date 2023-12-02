'use client';

import dynamic from 'next/dynamic.js';
import { usePathname } from 'next/navigation.js';
import type { HTMLProps } from 'react';

// @ts-ignore
const DynamicCalendar = dynamic(() => import('@masknet/plugin-calendar').then((x) => ({ default: x.RenderCalendar })), {
    ssr: false,
});

export function CalendarWidget(props: HTMLProps<HTMLDivElement>) {
    const pathname = usePathname();
    const isSettingsPage = pathname.startsWith('/settings');

    if (isSettingsPage) return null;

    return (
        <section {...props}>
            <DynamicCalendar />
        </section>
    );
}
