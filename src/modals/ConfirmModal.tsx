import { t, Trans } from '@lingui/macro';
import React, { forwardRef, useState } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { Modal } from '@/components/Modal.js';
import { classNames } from '@/helpers/classNames.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';

export interface ConfirmModalOpenProps {
    title?: string;
    content: React.ReactNode;
    confirmButtonText?: string;
    cancelButtonText?: string;
    enableConfirmButton?: boolean;
    enableCancelButton?: boolean;
    enableCloseButton?: boolean;
    disableBackdropClose?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
    variant?: 'normal' | 'danger';
}

export type ConfirmModalCloseProps = boolean;

export const ConfirmModal = forwardRef<SingletonModalRefCreator<ConfirmModalOpenProps, ConfirmModalCloseProps>>(
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
                    dispatch?.close(false);
                }}
            >
                <div
                    className="relative w-[355px] max-w-[90vw] rounded-xl bg-bgModal shadow-popover transition-all dark:text-gray-950"
                    onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                    }}
                >
                    <div className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-t-[12px] p-4">
                        {props.enableCloseButton ? (
                            <CloseButton
                                onClick={() => {
                                    props.onCancel?.();
                                    dispatch?.close(false);
                                }}
                            />
                        ) : null}
                        <div className="shrink grow basis-0 text-center text-lg font-bold leading-snug text-main">
                            {props.title ? props.title : <Trans>Confirmation</Trans>}
                        </div>
                        {props.enableCloseButton ? <div className="relative h-6 w-6" /> : null}
                    </div>

                    <div className="flex flex-col gap-2 p-6">
                        {props.content}
                        {props.enableCancelButton || props.enableConfirmButton ? (
                            <div className="flex flex-row gap-3">
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
                                            props.variant === 'normal'
                                                ? 'bg-main text-primaryBottom'
                                                : 'bg-commonDanger text-lightBottom',
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
