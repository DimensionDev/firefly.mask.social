import { Menu, type MenuProps, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { Fragment } from 'react';

import { type SocialSource } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { LoginModalRef } from '@/modals/controls.js';

interface MoreActionMenuProps extends MenuProps<'div'> {
    button: React.ReactNode;
    children: React.ReactNode;
    source?: SocialSource;
    disabled?: boolean;
    className?: string;
}

export function MoreActionMenu({ disabled, button, children, className, source }: MoreActionMenuProps) {
    const isLogin = useIsLogin();

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
                    if (!isLogin) {
                        event.preventDefault();
                        return LoginModalRef.open({ source });
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
