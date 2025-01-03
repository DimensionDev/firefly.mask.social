'use client';

import { Trans } from '@lingui/macro';
import { forwardRef, useRef, useState } from 'react';

import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { Popover } from '@/modals/FrameViewerModal/Popover.js';
import type { FrameV2 } from '@/types/frame.js';

export interface ReviewTransactionPopoverProps {
    frame?: FrameV2;
    content?: React.ReactNode;
}

export const ReviewTransactionPopover = forwardRef<SingletonModalRefCreator<ReviewTransactionPopoverProps, boolean>>(
    function ReviewTransactionPopover(_, ref) {
        const [props, setProps] = useState<ReviewTransactionPopoverProps>();

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(props) {
                setProps(props);
            },
        });

        return (
            <Popover
                title={<Trans>Review Transaction</Trans>}
                content={props?.content}
                frame={props?.frame}
                open={open}
                onClose={() => dispatch?.close(false)}
            />
        );
    },
);
