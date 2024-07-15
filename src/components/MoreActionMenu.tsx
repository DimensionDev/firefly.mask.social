import { Menu, type MenuProps, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { Fragment, type MouseEvent } from 'react';

import { classNames } from '@/helpers/classNames.js';

interface MoreActionMenuProps extends Omit<MenuProps<'div'>, 'onClick'> {
    button: React.ReactNode;
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
    onClick?: (event: MouseEvent<HTMLButtonElement>) => Promise<void>;
}

export function MoreActionMenu({ disabled, button, children, className, onClick }: MoreActionMenuProps) {
    return (
        <Menu
            className={classNames('relative', className)}
            as="div"
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <Menu.Button
                disabled={disabled}
                whileTap={{ scale: 0.9 }}
                as={motion.button}
                className="flex flex-shrink-0 items-center text-secondary"
                aria-label="More"
                onClick={async (event) => {
                    event.stopPropagation();
                    if (onClick) {
                        await onClick(event);
                    }
                }}
            >
                {button}
            </Menu.Button>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                {children}
            </Transition>
        </Menu>
    );
}
