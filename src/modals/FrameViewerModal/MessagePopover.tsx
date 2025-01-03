'use client';

import { forwardRef, useRef, useState } from 'react';

import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { Popover } from '@/modals/FrameViewerModal/Popover.js';

export interface MessagePopoverProps {
    type: 'success' | 'error' | 'warning' | 'info';
    content?: React.ReactNode;
    onClose?: () => void;
}

export const MessagePopover = forwardRef<SingletonModalRefCreator<MessagePopoverProps>>(
    function MessagePopover(_, ref) {
        const [props, setProps] = useState<MessagePopoverProps>();
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

        if (!props) return null;

        return (
            <Popover open={open} onClose={() => dispatch?.close()}>
                {props.content}
            </Popover>
        );
    },
);
