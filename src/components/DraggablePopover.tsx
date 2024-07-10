'use client';

import { useSingletonModal } from '@masknet/shared-base-ui';
import { forwardRef, useState } from 'react';

import { Popover } from '@/components/Popover.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';

export interface DraggablePopoverProps {
    backdrop?: boolean;
    content?: React.ReactNode;
}

export const DraggablePopover = forwardRef<SingletonModalRefCreator<DraggablePopoverProps>>(
    function DraggablePopover(_, ref) {
        const [enableBackdrop, setEnableBackdrop] = useState(true);
        const [content, setContent] = useState<React.ReactNode>();

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(props) {
                setEnableBackdrop(props.backdrop ?? true);
                setContent(props.content);
            },
        });

        return (
            <Popover open={open} backdrop={enableBackdrop} onClose={() => dispatch?.close()}>
                {content}
            </Popover>
        );
    },
);
