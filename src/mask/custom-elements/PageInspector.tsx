'use client';

import dynamic from 'next/dynamic.js';

import { Widget } from '@/mask/custom-elements/Widget.js';

// @ts-ignore
const PageInspector = dynamic(() => import('@/mask/widgets/PageInspector.js'), { ssr: false });

class Element extends Widget {
    constructor() {
        super(PageInspector);
    }
}

customElements.define('mask-page-inspector', Element);
