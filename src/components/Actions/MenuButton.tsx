import { forwardRef } from 'react';

import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';

export const MenuButton = forwardRef<HTMLButtonElement, ClickableButtonProps>(function MenuButton(props, ref) {
    return (
        <ClickableButton
            {...props}
            className={classNames(
                'flex h-8 cursor-pointer items-center space-x-2 px-3 py-1 hover:bg-bg',
                props.className,
            )}
            ref={ref}
        />
    );
});
