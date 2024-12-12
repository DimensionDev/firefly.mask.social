import { Menu, MenuButton, type MenuProps, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { Fragment, type MouseEvent } from 'react';

import { type SocialSource } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { stopEvent } from '@/helpers/stopEvent.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { LoginModalRef } from '@/modals/controls.js';

interface MoreActionMenuProps extends MenuProps<'div'> {
    button: React.ReactNode;
    children: React.ReactNode;
    source?: SocialSource;
    className?: string;
    disabled?: boolean;
    loginRequired?: boolean;
}

export function MoreActionMenu({
    disabled,
    button,
    children,
    className,
    source,
    loginRequired = true,
}: MoreActionMenuProps) {
    const isLogin = useIsLogin();

    return (
        <Menu className={classNames('relative', className)} as="div" onClick={stopEvent}>
            <MenuButton
                disabled={disabled}
                whileTap={{ scale: 0.9 }}
                as={motion.button}
                className="flex flex-shrink-0 items-center text-lightMain"
                aria-label="More"
                onClick={(event: MouseEvent) => {
                    event.stopPropagation();
                    if (!isLogin && loginRequired) {
                        event.preventDefault();
                        LoginModalRef.open({ source });
                        return;
                    }
                }}
            >
                {button}
            </MenuButton>
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
