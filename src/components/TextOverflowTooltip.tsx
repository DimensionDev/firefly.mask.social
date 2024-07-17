import type { TippyProps } from '@tippyjs/react';
import { cloneElement, memo, type ReactElement, type ReactNode } from 'react';

import { Tippy } from '@/esm/Tippy.js';
import { classNames } from '@/helpers/classNames.js';
import { useDetectOverflow } from '@/hooks/useDetectOverflow.js';

export interface TextOverflowTooltipProps extends Omit<TippyProps, 'ref' | 'title' | 'children'> {
    withDelay?: boolean;
    content: ReactNode;
    children: ReactElement;
}

export const TextOverflowTooltip = memo(function TextOverflowTooltip({
    children,
    withDelay,
    ...rest
}: TextOverflowTooltipProps) {
    const [overflow, ref] = useDetectOverflow();
    return (
        <Tippy
            className={classNames(
                'hidden !rounded-lg !text-xs !leading-6 tracking-wide',
                overflow ? 'sm:block' : 'hidden',
            )}
            delay={[withDelay ? 500 : 0, 0]}
            {...rest}
        >
            {cloneElement(children, { ...children.props, ref, 'data-overflow': overflow })}
        </Tippy>
    );
});
