import { createRoot } from 'react-dom/client';

import { getProps } from '@/mask/custom-elements/props-pool.js';
import { Widget } from '@/mask/custom-elements/Widget.js';

export class WidgetWithProps<T> extends Widget {
    override connectedCallback() {
        this.root = createRoot(this);

        const propsId = this.getAttribute('props-id');
        const props = propsId ? (getProps(propsId) as T) : undefined;

        this.root.render(<this.Component {...props} />);
    }
}
