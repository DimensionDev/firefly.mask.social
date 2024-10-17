import { forwardRef, type HTMLProps } from 'react';

import { classNames } from '@/helpers/classNames.js';

export const MenuButton = forwardRef<HTMLButtonElement, HTMLProps<HTMLButtonElement>>(function MenuButton(props, ref) {
    return (
        <button
            {...props}
            type={props.type as 'button'}
            className={classNames(
                'flex h-8 cursor-pointer items-center space-x-2 px-3 py-1 hover:bg-bg',
                props.className,
            )}
            ref={ref}
        />
    );
});
