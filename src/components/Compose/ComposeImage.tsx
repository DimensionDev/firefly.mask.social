import { memo, useMemo } from 'react';

import { RemoveButton } from '@/components/RemoveButton.js';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveMediaPreviewURL } from '@/helpers/resolveMediaURL.js';
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
    const mediaURL = useMemo(() => resolveMediaPreviewURL(image), [image]);

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
            <Image src={mediaURL} alt={image.file.name} fill className="object-cover" />

            {!readonly ? (
                <RemoveButton className="absolute right-1 top-1 z-10" onClick={() => removeImage(image)} />
            ) : null}
        </div>
    );
});
