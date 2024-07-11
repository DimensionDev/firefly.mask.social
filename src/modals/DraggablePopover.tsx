'use client';

import { forwardRef, useState } from 'react';

import { Popover } from '@/components/Popover.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';

export interface DraggablePopoverProps {
    backdrop?: boolean;
    content?: React.ReactNode;
    enableOverflow?: boolean;
}

export const DraggablePopover = forwardRef<SingletonModalRefCreator<DraggablePopoverProps>>(
    function DraggablePopover(_, ref) {
        const [enableBackdrop, setEnableBackdrop] = useState(true);
        const [content, setContent] = useState<React.ReactNode>();
        const [enableOverflow, setEnableOverflow] = useState(true);

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(props) {
                setEnableBackdrop(props.backdrop ?? true);
                setContent(props.content);
                setEnableOverflow(props.enableOverflow ?? true);
            },
        });

        return (
            <Popover
                open={open}
                backdrop={enableBackdrop}
                onClose={() => dispatch?.close()}
                enableOverflow={enableOverflow}
            >
                {content}
            </Popover>
        );
    },
);
