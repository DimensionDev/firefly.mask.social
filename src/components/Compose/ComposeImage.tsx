import { memo } from 'react';

import { ImageAsset } from '@/components/Posts/ImageAsset.js';
import { RemoveButton } from '@/components/RemoveButton.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveMediaObjectUrl } from '@/helpers/resolveMediaObjectUrl.js';
import { sanitizeDStorageUrl } from '@/helpers/sanitizeDStorageUrl.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import type { MediaObject } from '@/types/compose.js';

interface ComposeImageProps {
    index: number;
    size: number;
    image: MediaObject;
    readonly?: boolean;
}
export const ComposeImage = memo(function ComposeImage({ index, size, image, readonly = false }: ComposeImageProps) {
    const { removeImage } = useComposeStateStore();

    return (
        <div
            className={classNames('group relative overflow-hidden rounded-2xl', {
                'col-span-2': size === 1,
                'h-72': size <= 2 || (size === 3 && index === 2),
                'h-[138px]': size === 4,
                'col-start-1': size === 3 && index === 1,
                'col-start-2 row-span-2 row-start-1': size === 3 && index === 2,
                'aspect-square': size >= 5,
                'h-auto': size >= 5,
            })}
        >
            <ImageAsset
                disableLoadHandler
                src={sanitizeDStorageUrl(resolveMediaObjectUrl(image))}
                alt={image.file.name}
                fill
                className="object-cover"
            />

            {!readonly ? (
                <RemoveButton className="absolute right-1 top-1 z-10" onClick={() => removeImage(image)} />
            ) : null}
        </div>
    );
});
