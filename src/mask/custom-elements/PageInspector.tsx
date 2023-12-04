'use client';

import dynamic from 'next/dynamic.js';
import { createRoot, type Root } from 'react-dom/client';

// @ts-ignore
const PageInspector = dynamic(() => import('@/mask/widgets/PageInspector.js'), { ssr: false });

class Element extends HTMLElement {
    private root: Root | null = null;

    constructor() {
        super();
    }

    connectedCallback() {
        this.root = createRoot(this);
        this.root.render(<PageInspector />);
    }

    disconnectedCallback() {
        this.root?.unmount();
    }
}

customElements.define('mask-page-inspector', Element);
