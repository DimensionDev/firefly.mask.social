import { Transition } from '@headlessui/react';
import React, { memo, useRef } from 'react';

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
        <div className="absolute inset-0 flex min-h-full flex-col items-center justify-end overflow-auto" ref={ref}>
            <Transition.Child
                as="div"
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div
                    className="absolute inset-0 top-[60px] bg-main/25 bg-opacity-30"
                    onClick={(ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        if (disableBackdropClose) return;
                        onClose?.();
                    }}
                />
            </Transition.Child>
            <Transition.Child
                as="div"
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="max-h-[400xp] rounded-tl-xl rounded-tr-xl bg-bg">{children}</div>
            </Transition.Child>
        </div>
    );
});
