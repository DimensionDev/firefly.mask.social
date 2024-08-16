import type { TippyProps } from '@tippyjs/react';
import { memo, useState } from 'react';

import { Tippy } from '@/esm/Tippy.js';

const DURATION = [100, 0] as [number, number];

export const InteractiveTippy = memo<TippyProps>(function InteractiveTippy({ children, ...rest }) {
    const [visible, setVisible] = useState(false);

    return (
        <Tippy
            visible={visible}
            onClickOutside={() => setVisible(false)}
            appendTo={() => document.body}
            duration={DURATION}
            delay={1000}
            arrow={false}
            trigger="mouseenter"
            hideOnClick
            interactive
            {...rest}
        >
            {children}
        </Tippy>
    );
});
