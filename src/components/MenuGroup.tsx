import { MenuItems, type MenuItemsProps } from '@headlessui/react';
import { forwardRef } from 'react';

import { classNames } from '@/helpers/classNames.js';
import { stopEvent } from '@/helpers/stopEvent.js';

interface MenuGroupProps extends MenuItemsProps {}

export const MenuGroup = forwardRef<HTMLElement, MenuGroupProps>(function MenuGroup(
    { className, children, onClick = stopEvent, ...rest },
    ref,
) {
    return (
        <MenuItems
            ref={ref}
            className={classNames(
                'z-[1000] flex w-max flex-col gap-2 overflow-hidden rounded-2xl border border-line bg-primaryBottom py-3 text-base text-main',
                typeof className === 'string' ? className : '',
            )}
            onClick={onClick}
            anchor="bottom end"
            {...rest}
        >
            {children}
        </MenuItems>
    );
});
