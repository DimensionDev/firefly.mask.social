'use client';

import dynamic from 'next/dynamic.js';

import { Widget } from '@/mask/custom-elements/Widget.js';

// @ts-ignore
const CalendarWidget = dynamic(() => import('@/mask/widgets/CalendarWidget.js'), { ssr: false });

class Element extends Widget {
    constructor() {
        super(CalendarWidget);
    }
}

customElements.define('mask-calendar-widget', Element);
