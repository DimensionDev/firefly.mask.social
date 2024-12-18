import { forwardRef, useState } from 'react';

import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { FrameViewer } from '@/modals/FrameV2Modal/FrameViewer.js';
import type { FrameV2 } from '@/types/frame.js';

export type FrameV2ModalProps = {
    frame: FrameV2;
};
export type FrameV2ModalCloseProps = void;

export const FrameV2Modal = forwardRef<SingletonModalRefCreator<FrameV2ModalProps>>(
    function FrameV2Modal(_, ref) {
        const [props, setProps] = useState<FrameV2ModalProps>();

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(p) {
                setProps(p);
            },
        });
        if (!open || !props) return null;

        return <FrameViewer {...props} onClose={() => dispatch?.close()} />;
    },
);
