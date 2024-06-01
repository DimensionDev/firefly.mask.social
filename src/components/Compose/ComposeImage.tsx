import { memo, useMemo } from 'react';

import { RemoveButton } from '@/components/RemoveButton.js';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import type { MediaObject } from '@/types/index.js';

interface ComposeImageProps {
    index: number;
    size: number;
    image: MediaObject;
    readonly?: boolean;
}
export const ComposeImage = memo(function ComposeImage({ index, size, image, readonly = false }: ComposeImageProps) {
    const { removeImage } = useComposeStateStore();
    const blobURL = useMemo(() => URL.createObjectURL(image.file), [image.file]);

    return (
        <div
            className={classNames(
                'group relative overflow-hidden rounded-2xl',
                size <= 2 ? 'h-72' : size === 3 && index === 2 ? 'h-72' : 'h-[138px]',
                size === 1 ? 'col-span-2' : '',
                size === 3 && index === 1 ? 'col-start-1' : '',
                size === 3 && index === 2 ? 'col-start-2 row-span-2 row-start-1' : '',
            )}
        >
            <Image src={blobURL} alt={image.file.name} fill className="object-cover" />

            {!readonly ? (
                <RemoveButton className="absolute right-1 top-1 z-10" onClick={() => removeImage(image)} />
            ) : null}
        </div>
    );
});
