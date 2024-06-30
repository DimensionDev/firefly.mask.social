import { t, Trans } from '@lingui/macro';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { noop } from 'lodash-es';
import React, { forwardRef, useState } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { Modal } from '@/components/Modal.js';
import { classNames } from '@/helpers/classNames.js';

export interface ConfirmModalOpenProps {
    title?: string;
    content: React.ReactNode;
    confirmButtonText?: string;
    cancelButtonText?: string;
    enableConfirmButton?: boolean;
    enableCancelButton?: boolean;
    enableCloseButton?: boolean;
    disableBackdropClose?: boolean;
    onCancel?: () => void;
    onConfirm?: () => void;
    variant?: 'normal' | 'danger';
}

export type ConfirmModalCloseProps = boolean;

export const ConfirmModal = forwardRef<SingletonModalRefCreator<ConfirmModalOpenProps, ConfirmModalCloseProps>>(
    function ConfirmModal(_, ref) {
        const [title, setTitle] = useState<string>();
        const [content, setContent] = useState<React.ReactNode>();
        const [confirmButtonText, setConfirmButtonText] = useState<string>();
        const [cancelButtonText, setCancelButtonText] = useState<string>();
        const [enableConfirmButton, setEnableConfirmButton] = useState<boolean>(true);
        const [enableCancelButton, setEnableCancelButton] = useState<boolean>(false);
        const [enableCloseButton, setEnableCloseButton] = useState<boolean>(true);
        const [disableBackdropClose, setDisableBackdropClose] = useState<boolean>(false);

        const [onCancel, setOnCancel] = useState(() => noop);
        const [onConfirm, setOnConfirm] = useState(() => noop);
        const [variant, setVariant] = useState<ConfirmModalOpenProps['variant']>('danger');

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(props) {
                setTitle(props.title);
                setVariant(props.variant || 'danger');
                setContent(props.content);
                setEnableConfirmButton(props.enableConfirmButton ?? true);
                setEnableCancelButton(props.enableCancelButton ?? false);
                setEnableCloseButton(props.enableCloseButton ?? true);
                setOnCancel(() => props.onCancel ?? noop);
                setOnConfirm(() => props.onConfirm ?? noop);
                setConfirmButtonText(props.confirmButtonText);
                setCancelButtonText(props.cancelButtonText);
                setDisableBackdropClose(props.disableBackdropClose ?? false);
            },
        });

        return (
            <Modal disableBackdropClose={disableBackdropClose} open={open} onClose={() => dispatch?.close(false)}>
                <div
                    className="relative w-[355px] max-w-[90vw] rounded-xl bg-bgModal shadow-popover transition-all dark:text-gray-950"
                    onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                    }}
                >
                    <div className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-t-[12px] p-4">
                        {enableCloseButton ? <CloseButton onClick={() => dispatch?.close(false)} /> : null}
                        <div className="shrink grow basis-0 text-center text-lg font-bold leading-snug text-main">
                            {title ? title : <Trans>Confirmation</Trans>}
                        </div>
                        {enableCloseButton ? <div className="relative h-6 w-6" /> : null}
                    </div>

                    <div className="flex flex-col gap-3 p-6">
                        {content}
                        {enableCancelButton || enableConfirmButton ? (
                            <div className="flex flex-row gap-3">
                                {enableCancelButton ? (
                                    <ClickableButton
                                        className="flex flex-1 items-center justify-center rounded-full border border-lightMain py-2 font-bold text-fourMain"
                                        onClick={() => {
                                            onCancel();
                                            dispatch?.close(false);
                                        }}
                                    >
                                        {cancelButtonText || t`Cancel`}
                                    </ClickableButton>
                                ) : null}
                                {enableConfirmButton ? (
                                    <ClickableButton
                                        className={classNames(
                                            'flex flex-1 items-center justify-center rounded-full py-2 font-bold',
                                            variant === 'normal'
                                                ? 'bg-main text-primaryBottom'
                                                : 'bg-commonDanger text-lightBottom',
                                        )}
                                        onClick={() => {
                                            onConfirm();
                                            dispatch?.close(true);
                                        }}
                                    >
                                        {confirmButtonText || t`Confirm`}
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
