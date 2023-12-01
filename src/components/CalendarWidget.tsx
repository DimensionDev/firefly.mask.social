'use client';

import dynamic from 'next/dynamic.js';
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
    return (
        <MaskRuntime>
            <section {...props}>
                <DynamicCalendar />
            </section>
        </MaskRuntime>
    );
}
