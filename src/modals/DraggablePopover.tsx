'use client';

import { forwardRef, useState } from 'react';

import { Popover } from '@/components/Popover.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';

export interface DraggablePopoverProps {
    backdrop?: boolean;
    content?: React.ReactNode;
    enableOverflow?: boolean;
    onClose?: () => void;
}

export const DraggablePopover = forwardRef<SingletonModalRefCreator<DraggablePopoverProps>>(
    function DraggablePopover(_, ref) {
        const [props, setProps] = useState<DraggablePopoverProps>();

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(props) {
                setProps({
                    ...props,
                    backdrop: props.backdrop ?? true,
                    enableOverflow: props.enableOverflow ?? true,
                });
            },
            onClose() {
                props?.onClose?.();
                setProps(undefined);
            },
        });

        if (!props) return null;

        return (
            <Popover
                open={open}
                backdrop={props.backdrop}
                onClose={() => dispatch?.close()}
                enableOverflow={props.enableOverflow}
            >
                {props.content}
            </Popover>
        );
    },
);
