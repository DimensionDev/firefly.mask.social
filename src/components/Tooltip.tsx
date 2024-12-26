import 'tippy.js/dist/tippy.css';

import type { TippyProps } from '@tippyjs/react';
import { memo, type ReactNode } from 'react';

import { Tippy } from '@/esm/Tippy.js';
import { classNames } from '@/helpers/classNames.js';
import { IS_MOBILE_DEVICE } from '@/constants/bowser.js';

interface TooltipProps extends TippyProps {
    content: ReactNode;
    withDelay?: boolean;
}

export const Tooltip = memo<TooltipProps>(function Tooltip({
    children,
    content,
    placement = 'right',
    withDelay = false,
    ...props
}) {
    // disable tooltips on mobile devices
    if (IS_MOBILE_DEVICE) return children;

    return (
        <Tippy
            placement={placement}
            duration={0}
            delay={[withDelay ? 500 : 0, 0]}
            content={<span>{content}</span>}
            {...props}
            className={classNames('hidden !rounded-lg !text-xs !leading-6 tracking-wide sm:block', props.className)}
        >
            {children}
        </Tippy>
    );
});
