'use client';

import dynamic from 'next/dynamic.js';
import type { HTMLProps } from 'react';

// @ts-ignore
const DynamicCalendar = dynamic(() => import('@masknet/plugin-calendar').then((x) => ({ default: x.RenderCalendar })), {
    ssr: false,
});

export function CalendarWidget(props: HTMLProps<HTMLDivElement>) {
    return (
        <section {...props}>
            <DynamicCalendar />
        </section>
    );
}
