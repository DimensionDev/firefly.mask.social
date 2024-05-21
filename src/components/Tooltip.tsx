import 'tippy.js/dist/tippy.css';

import type { TippyProps } from '@tippyjs/react';
import { memo, type ReactNode } from 'react';

import { Tippy } from '@/esm/Tippy.js';

interface TooltipProps extends TippyProps {
    content: ReactNode;
    className?: string;
    withDelay?: boolean;
}

export const Tooltip = memo<TooltipProps>(function Tooltip({
    children,
    content,
    placement = 'right',
    className = '',
    withDelay = false,
    ...rest
}) {
    return (
        <Tippy
            placement={placement}
            duration={0}
            delay={[withDelay ? 500 : 0, 0]}
            className="hidden !rounded-lg !text-xs !leading-6 tracking-wide sm:block"
            content={<span>{content}</span>}
            {...rest}
        >
            <span className={className}>{children}</span>
        </Tippy>
    );
});
