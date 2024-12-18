import { t, Trans } from '@lingui/macro';
import React, { forwardRef, useState } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { CloseButton } from '@/components/IconButton.js';
import { Modal } from '@/components/Modal.js';
import { classNames } from '@/helpers/classNames.js';
import { stopEvent } from '@/helpers/stopEvent.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';

export interface ConfirmModalOpenProps {
    title?: string;
    content: React.ReactNode;
    contentClass?: string;
    modalClass?: string;
    confirmButtonClass?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    enableConfirmButton?: boolean;
    enableCancelButton?: boolean;
    enableCloseButton?: boolean;
    disableBackdropClose?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
    variant?: 'normal' | 'secondary' | 'danger';
}

/** Dismissing dialog returns null */
export type ConfirmModalCloseResult = boolean | null;

export const ConfirmModal = forwardRef<SingletonModalRefCreator<ConfirmModalOpenProps, ConfirmModalCloseResult>>(
    function ConfirmModal(_, ref) {
        const [props, setProps] = useState<ConfirmModalOpenProps>();

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: (props) => {
                setProps({
                    ...props,
                    variant: props.variant || 'danger',
                    enableConfirmButton: props.enableConfirmButton ?? true,
                    enableCancelButton: props.enableCancelButton ?? false,
                    enableCloseButton: props.enableCloseButton ?? true,
                    disableBackdropClose: props.disableBackdropClose ?? false,
                });
            },
            onClose: () => setProps(undefined),
        });

        if (!props) return null;

        return (
            <Modal
                disableBackdropClose={props.disableBackdropClose}
                open={open}
                onClose={() => {
                    props.onCancel?.();
                    dispatch?.close(null);
                }}
            >
                <div
                    className={classNames(
                        'relative w-[320px] max-w-[clamp(386px,90vw,95vw)] rounded-xl bg-bgModal shadow-popover transition-all dark:text-gray-950 md:w-[355px]',
                        props.modalClass,
                    )}
                    onClick={stopEvent}
                >
                    <div className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-t-[12px] p-4">
                        {props.enableCloseButton ? (
                            <CloseButton
                                onClick={() => {
                                    props.onCancel?.();
                                    dispatch?.close(null);
                                }}
                            />
                        ) : null}
                        <div className="shrink grow basis-0 text-center text-lg font-bold leading-snug text-main">
                            {props.title ? props.title : <Trans>Confirmation</Trans>}
                        </div>
                        {props.enableCloseButton ? <div className="relative h-6 w-6" /> : null}
                    </div>

                    <div className={classNames('flex flex-col gap-2 p-6 max-md:pt-0', props.contentClass)}>
                        {props.content}
                        {props.enableCancelButton || props.enableConfirmButton ? (
                            <div className="flex flex-col-reverse gap-4 md:flex-row md:gap-3">
                                {props.enableCancelButton ? (
                                    <ClickableButton
                                        className="flex flex-1 items-center justify-center rounded-full border border-lightMain py-2 font-bold text-fourMain"
                                        onClick={() => {
                                            props.onCancel?.();
                                            dispatch?.close(false);
                                        }}
                                    >
                                        {props.cancelButtonText || t`Cancel`}
                                    </ClickableButton>
                                ) : null}
                                {props.enableConfirmButton ? (
                                    <ClickableButton
                                        className={classNames(
                                            'flex flex-1 items-center justify-center rounded-full py-2 font-bold',
                                            {
                                                'bg-main text-primaryBottom': props.variant === 'normal',
                                                'bg-commonDanger text-lightBottom': props.variant === 'danger',
                                                'border border-main bg-bottom text-main': props.variant === 'secondary',
                                            },
                                            props.confirmButtonClass,
                                        )}
                                        onClick={() => {
                                            props.onConfirm?.();
                                            dispatch?.close(true);
                                        }}
                                    >
                                        {props.confirmButtonText || t`Confirm`}
                                    </ClickableButton>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </div>
            </Modal>
        );
    },
);
