import { forwardRef, useState } from 'react';

import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { ImageEditor, type ImageEditorProps } from '@/modals/ImageEditor/ImageEditor.js';

export type ImageEditorOpenProps = Omit<ImageEditorProps, 'open' | 'onSave' | 'onClose'>;
export type ImageEditorCloseProps = File | null;

export const ImageEditorModal = forwardRef<SingletonModalRefCreator<ImageEditorOpenProps, ImageEditorCloseProps>>(
    function ImageEditorModal(_, ref) {
        const [props, setProps] = useState<ImageEditorOpenProps>();

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(p) {
                setProps(p);
            },
        });
        if (!open || !props) return null;

        return <ImageEditor open {...props} onClose={() => dispatch?.close(null)} onSave={dispatch?.close} />;
    },
);
