import { useForkRef } from '@mui/material';
import { compact } from 'lodash-es';
import { forwardRef, type HTMLProps, memo, useEffect, useRef, useState } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import { classNames } from '@/helpers/classNames.js';
import { isValidFileType } from '@/helpers/isValidFileType.js';

interface UploadDropAreaProps extends HTMLProps<HTMLDivElement> {
    loading?: boolean;
    onDropFiles: (files: File[]) => Promise<void>;
}
export const UploadDropArea = memo(
    forwardRef<HTMLDivElement, UploadDropAreaProps>(function UploadDropArea(
        { loading, children, onDrop, onDropFiles, ...props },
        ref,
    ) {
        const [isDragging, setIsDragging] = useState(false);
        const containerRef = useRef<HTMLDivElement>(null);
        const forkedRef = useForkRef(containerRef, ref);

        useEffect(() => {
            const ele = containerRef.current;
            if (!ele) return;

            const handleDragOver = (e: DragEvent) => {
                e.preventDefault();
                setIsDragging(true);
            };
            const handleDrop = (e: DragEvent) => {
                e.preventDefault();
                setIsDragging(false);
                onDropFiles(Array.from(e.dataTransfer?.files ?? []));
            };
            ele.addEventListener('dragover', handleDragOver);
            ele.addEventListener('drop', handleDrop);
            return () => {
                ele.removeEventListener('dragover', handleDragOver);
                ele.removeEventListener('drop', handleDrop);
            };
        }, [onDropFiles]);

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
                    'relative',
                    props.className,
                    isDragging ? 'border-highlight' : 'border-secondaryLine',
                )}
                ref={forkedRef}
            >
                {children}
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/10 text-secondary">
                        <LoadingIcon className="animate-spin" width={40} height={40} />
                    </div>
                ) : null}
            </div>
        );
    }),
);
