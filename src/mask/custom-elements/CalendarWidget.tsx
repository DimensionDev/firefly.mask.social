'use client';

import dynamic from 'next/dynamic.js';
import { createRoot, type Root } from 'react-dom/client';

// @ts-ignore
const CalendarWidget = dynamic(() => import('@/mask/widgets/CalendarWidget.js'), { ssr: false });

class Element extends HTMLElement {
    private root: Root | null = null;

    constructor() {
        super();
    }

    connectedCallback() {
        this.root = createRoot(this);
        this.root.render(<CalendarWidget />);
    }

    disconnectedCallback() {
        this.root?.unmount();
    }
}

customElements.define('mask-calendar-widget', Element);
