import { classNames } from '@/helpers/classNames.js';

import { Dialog, Transition, type DialogProps } from '@headlessui/react';
import { noop } from 'lodash-es';
import React, { Fragment, useRef, type HTMLProps } from 'react';

import { memo } from 'react';

interface PopoverProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    disableBackdropClose?: boolean;
}

export const Popover = memo(function Popover({ open, onClose, children, disableBackdropClose }: PopoverProps) {
    const ref = useRef<HTMLDivElement>(null);

    if (!open) return null;

    return (
        <div
            className={classNames('flex min-h-full items-center justify-center overflow-auto p-0 text-center md:p-4')}
            ref={ref}
        >
            <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div
                    className="fixed inset-0 bg-main/25 bg-opacity-30"
                    onClick={(ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        if (disableBackdropClose) return;
                        onClose?.();
                    }}
                />
            </Transition.Child>
            <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                {children}
            </Transition.Child>
        </div>
    );
});
