import { parseJSON } from '@masknet/web3-providers/helpers';
import { createRoot } from 'react-dom/client';

import { Widget } from '@/mask/custom-elements/Widget.js';

export class WidgetWithProps<T> extends Widget {
    get props() {
        const raw = this.getAttribute('props');
        if (!raw) return;

        return parseJSON<T>(decodeURIComponent(raw));
    }

    override connectedCallback() {
        this.root = createRoot(this);
        this.root.render(<this.Component {...this.props} />);
    }
}
