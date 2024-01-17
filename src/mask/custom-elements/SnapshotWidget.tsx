'use client';

import dynamic from 'next/dynamic.js';

import { WidgetWithProps } from '@/mask/custom-elements/WidgetWithProps.js';

// @ts-ignore
const SnapshotWidget = dynamic(() => import('@/mask/widgets/SnapshotWidget.js'), { ssr: false });

class Element extends WidgetWithProps<{ url: string }> {
    constructor() {
        super(SnapshotWidget);
    }
}

customElements.define('mask-snapshot-widget', Element);
