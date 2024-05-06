import { t, Trans } from '@lingui/macro';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import React, { forwardRef, useState } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { Modal } from '@/components/Modal.js';

export interface ConfirmModalOpenProps {
    title?: string;
    content: React.ReactNode;
    confirmButtonText?: string;
    cancelButtonText?: string;
    enableConfirmButton?: boolean;
    enableCancelButton?: boolean;
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

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(props) {
                setTitle(props.title);
                setContent(props.content);
                setEnableConfirmButton(props.enableConfirmButton ?? true);
                setEnableCancelButton(props.enableCancelButton ?? false);
                setConfirmButtonText(props.confirmButtonText);
                setCancelButtonText(props.cancelButtonText);
            },
        });

        return (
            <Modal open={open} onClose={() => dispatch?.close(false)}>
                <div className="relative w-[355px] rounded-xl bg-bgModal shadow-popover transition-all dark:text-gray-950">
                    <div className="inline-flex h-[56px] w-[355px] items-center justify-center gap-2 rounded-t-[12px] p-4">
                        <CloseButton onClick={() => dispatch?.close(false)} />
                        <div className="shrink grow basis-0 text-center text-lg font-bold leading-snug text-main">
                            {title ? title : <Trans>Confirmation</Trans>}
                        </div>
                        <div className="relative h-6 w-6" />
                    </div>

                    <div className="flex flex-col gap-3 p-6">
                        {content}
                        <div className=" flex flex-row gap-3">
                            {enableCancelButton ? (
                                <ClickableButton
                                    className=" flex flex-1 items-center justify-center rounded-full border border-lightBottom py-[11px] font-bold text-lightBottom"
                                    onClick={() => dispatch?.close(false)}
                                >
                                    {cancelButtonText || t`Cancel`}
                                </ClickableButton>
                            ) : null}
                            {enableConfirmButton ? (
                                <ClickableButton
                                    className=" flex flex-1 items-center justify-center rounded-full bg-commonDanger py-[11px] font-bold text-lightBottom"
                                    onClick={() => dispatch?.close(true)}
                                >
                                    {confirmButtonText || t`Confirm`}
                                </ClickableButton>
                            ) : null}
                        </div>
                    </div>
                </div>
            </Modal>
        );
    },
);
