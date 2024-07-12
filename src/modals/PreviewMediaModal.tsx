import { forwardRef, useState } from 'react';

import { PreviewMedia, type PreviewMediaProps } from '@/components/PreviewMedia/index.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';

export interface PreviewMediaModalOpenProps extends Omit<PreviewMediaProps, 'open' | 'onClose'> {}

export const PreviewMediaModal = forwardRef<SingletonModalRefCreator<PreviewMediaModalOpenProps>>(
    function PreviewMediaModal(_, ref) {
        const [props, setProps] = useState<PreviewMediaModalOpenProps>();

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: (props) => setProps(props),
            onClose: () => setProps(undefined),
        });

        if (!props) return null;

        return <PreviewMedia {...props} open={open} onClose={() => dispatch?.close()} />;
    },
);
