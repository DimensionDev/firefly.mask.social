import { Image } from '@/components/Image.js';
import { Link } from '@/components/Link.js';
import { parseUrl } from '@/helpers/parseUrl.js';
import type { FrameV2 } from '@/types/frame.js';
import { Transition } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import React, { Fragment, memo } from 'react';

interface PopoverProps {
    open: boolean;
    onClose: () => void;
    frame?: FrameV2;
    title?: React.ReactNode;
    content?: React.ReactNode;
}

export const Popover = memo(function Popover({ frame, open, onClose, title, content }: PopoverProps) {
    const u = frame?.x_url ? parseUrl(frame.x_url) : null;

    return (
        <Transition appear show={open} as="div">
            <div className="absolute inset-0 flex min-h-full flex-col items-center justify-end overflow-auto">
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
                            onClose?.();
                        }}
                    />
                </Transition.Child>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300 transform"
                    enterFrom="translate-y-full"
                    enterTo="translate-y-0"
                    leave="ease-in duration-200 transform"
                    leaveFrom="translate-y-0"
                    leaveTo="translate-y-full"
                >
                    <div className="relative z-10 max-h-[400px] w-full rounded-tl-xl rounded-tr-xl bg-darkBottom">
                        <div className="flex items-center border-b border-line p-3">
                            {frame ? (
                                <Image
                                    className="mr-2 rounded-xl"
                                    alt={frame.button.action.name}
                                    src={frame.button.action.splashImageUrl}
                                    width={42}
                                    height={42}
                                />
                            ) : null}
                            <div className="text-left">
                                <h2 className="text-sm font-bold">{title}</h2>
                                {u ? (
                                    <p className="mt-1 text-xs text-secondary">
                                        <Trans>
                                            Requested from{' '}
                                            <Link className="text-fireflyBrand" href={u.href}>
                                                {u.host}
                                            </Link>
                                        </Trans>
                                    </p>
                                ) : null}
                            </div>
                        </div>
                        <div className="p-3">{content}</div>
                    </div>
                </Transition.Child>
            </div>
        </Transition>
    );
});
