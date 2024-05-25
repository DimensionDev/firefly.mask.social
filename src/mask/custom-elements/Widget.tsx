import type { JSX } from 'react';
import { createRoot, type Root } from 'react-dom/client';

export class Widget extends HTMLElement {
    protected root: Root | null = null;

    constructor(protected Component: () => JSX.Element) {
        super();
    }

    connectedCallback() {
        this.root = createRoot(this);
        this.root.render(<this.Component />);
    }

    disconnectedCallback() {
        this.root?.unmount();
    }
}
