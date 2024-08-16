import type { TippyProps } from '@tippyjs/react';
import { memo } from 'react';

import { Tippy } from '@/esm/Tippy.js';

const DURATION = [100, 0] as [number, number];

export const InteractiveTippy = memo<TippyProps>(function InteractiveTippy({ children, ...rest }) {
    return (
        <Tippy
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
