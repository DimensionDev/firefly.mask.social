import { forwardRef, useState } from 'react';

import { PreviewMedia, type PreviewMediaProps } from '@/components/PreviewMedia/index.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';

export interface PreviewMediaModalOpenProps extends Omit<PreviewMediaProps, 'open' | 'onClose'> {}

export const PreviewMediaModal = forwardRef<SingletonModalRefCreator<PreviewMediaModalOpenProps>>(
    function PreviewMediaModal(_, ref) {
        const [previewData, setPreviewData] = useState<PreviewMediaModalOpenProps>();

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: (props) => setPreviewData(props),
            onClose: () => setPreviewData(undefined),
        });

        if (!previewData) return null;

        return <PreviewMedia {...previewData} open={open} onClose={() => dispatch?.close()} />;
    },
);
