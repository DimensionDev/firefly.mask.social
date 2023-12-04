'use client';

import dynamic from 'next/dynamic.js';
import { createRoot, type Root } from 'react-dom/client';

// @ts-ignore
const DecryptedPost = dynamic(() => import('@/mask/widgets/DecryptedPost.js'), { ssr: false });

class Element extends HTMLElement {
    private root: Root | null = null;

    constructor() {
        super();
    }

    connectedCallback() {
        this.root = createRoot(this);
        this.root.render(<DecryptedPost />);
    }

    disconnectedCallback() {
        this.root?.unmount();
    }
}

customElements.define('mask-decrypted-post', Element);
