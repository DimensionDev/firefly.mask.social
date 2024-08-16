import type { TippyProps } from '@tippyjs/react';
import { memo } from 'react';

import { Tippy } from '@/esm/Tippy.js';

export const InteractiveTippy = memo<TippyProps>(function InteractiveTippy({ children, ...rest }) {
    return (
        <Tippy
            appendTo={() => document.body}
            duration={300}
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
