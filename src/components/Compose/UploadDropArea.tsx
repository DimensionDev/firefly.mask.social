import { useForkRef } from '@mui/material';
import { compact } from 'lodash-es';
import { forwardRef, type HTMLProps, memo, useEffect, useRef, useState } from 'react';

import { SUPPORTED_VIDEO_SOURCES } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { getCurrentPostImageLimits } from '@/helpers/getCurrentPostImageLimits.js';
import { isImageFileType } from '@/helpers/isImageFileType.js';
import { isValidFileType } from '@/helpers/isValidFileType.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

interface UploadDropAreaProps extends HTMLProps<HTMLDivElement> {
    onDropFiles: (files: File[]) => void;
}
export const UploadDropArea = memo(
    forwardRef<HTMLDivElement, UploadDropAreaProps>(function UploadDropArea(
        { onDrop, children, onDropFiles, ...props },
        ref,
    ) {
        const [isDragging, setIsDragging] = useState(false);
        const [canDrop, setCanDrop] = useState(true);
        const containerRef = useRef<HTMLDivElement>(null);
        const forkedRef = useForkRef(containerRef, ref);

        const { type } = useComposeStateStore();
        const { availableSources, video, images } = useCompositePost();
        const maxImageCount = getCurrentPostImageLimits(type, availableSources);
        const disabledVideo =
            !!video ||
            images.length > 0 ||
            availableSources.some((source) => !SUPPORTED_VIDEO_SOURCES.includes(source));
        const disableImage = images.length >= maxImageCount;

        useEffect(() => {
            const ele = containerRef.current;
            if (!ele) return;
            const controller = new AbortController();

            const handleDragOver = (e: DragEvent) => {
                e.preventDefault();
                setIsDragging(true);
                if (!e.dataTransfer) return;
                const files = [...e.dataTransfer.files];
                const canDropVideo = disabledVideo ? false : files.some((file) => isValidFileType(file.type));
                const canDropImage = disableImage ? false : files.some((file) => isImageFileType(file.type));
                const canDrop = canDropVideo || canDropImage;
                setCanDrop(canDrop);
            };
            const handleDrop = (e: DragEvent) => {
                e.preventDefault();
                setIsDragging(false);
                onDropFiles(Array.from(e.dataTransfer?.files ?? []));
            };
            const handleDragLeave = () => {
                setIsDragging(false);
            };
            ele.addEventListener('dragover', handleDragOver, { signal: controller.signal });
            ele.addEventListener('drop', handleDrop, { signal: controller.signal });
            ele.addEventListener('dragleave', handleDragLeave, { signal: controller.signal });
            return () => controller.abort();
        }, [onDropFiles, disabledVideo, disableImage]);

        useEffect(() => {
            const ele = containerRef.current;
            if (!ele) return;
            const handlePaste = (e: ClipboardEvent) => {
                const items = e.clipboardData?.items;
                if (!items) return;
                const files = compact([...items].map((x) => (isValidFileType(x.type) ? x.getAsFile() : null)));
                onDropFiles(files);
            };
            ele.addEventListener('paste', handlePaste);
            return () => {
                ele.removeEventListener('paste', handlePaste);
            };
        }, [onDropFiles]);

        return (
            <div
                {...props}
                className={classNames(
                    props.className,
                    isDragging ? 'border-dashed border-highlight' : 'border-secondaryLine',
                    {
                        'cursor-not-allowed [&_*]:cursor-not-allowed': !canDrop && isDragging,
                    },
                )}
                ref={forkedRef}
            >
                {children}
            </div>
        );
    }),
);
