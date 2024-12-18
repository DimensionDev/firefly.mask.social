import { forwardRef, useState } from 'react';

import { Modal } from '@/components/Modal.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { FrameViewer } from '@/modals/FrameViewerModal/FrameViewer.js';
import type { FrameV2 } from '@/types/frame.js';

export type FrameViewerModalOpenProps = {
    frame: FrameV2;
};
export type FrameViewerModalCloseProps = void;

export const FrameViewerModal = forwardRef<SingletonModalRefCreator<FrameViewerModalOpenProps, FrameViewerModalCloseProps>>(
    function FrameViewerModal(_, ref) {
        const [props, setProps] = useState<FrameViewerModalOpenProps>();

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(p) {
                setProps(p);
            },
            onClose() {
                setProps(undefined);
            }
        });

        const onClose = () => dispatch?.close();

        if (!open || !props) return null;

        return (
            <Modal open={open} onClose={onClose}>
                <FrameViewer frame={props.frame} onClose={onClose} />
            </Modal>
        );
    },
);
