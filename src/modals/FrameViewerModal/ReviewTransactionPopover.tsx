'use client';

import { forwardRef, useRef, useState } from 'react';

import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { Popover } from '@/modals/FrameViewerModal/Popover.js';
import type { FrameV2 } from '@/types/frame.js';
import { Trans } from '@lingui/macro';

export interface ReviewTransactionPopoverProps {
    frame?: FrameV2;
    content?: React.ReactNode;
    onClose?: () => void;
}

export const ReviewTransactionPopover = forwardRef<SingletonModalRefCreator<ReviewTransactionPopoverProps>>(
    function ReviewTransactionPopover(_, ref) {
        const [props, setProps] = useState<ReviewTransactionPopoverProps>();
        const timerRef = useRef<NodeJS.Timeout>();

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(props) {
                clearTimeout(timerRef.current);
                setProps(props);
            },
            onClose() {
                props?.onClose?.();
                timerRef.current = setTimeout(() => {
                    setProps(undefined);
                }, 200); // 200, duration of popover leaving
            },
        });

        return (
            <Popover
                title={<Trans>Review Transaction</Trans>}
                content={props?.content}
                frame={props?.frame}
                open={open}
                onClose={() => dispatch?.close()}
            />
        );
    },
);
