import { type HTMLProps, memo } from 'react';

import { ImageAsset } from '@/components/Posts/ImageAsset.js';
import { RemoveButton } from '@/components/RemoveButton.js';
import { ATTACHMENT } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { formatImageUrl } from '@/helpers/formatImageUrl.js';
import { resolveMediaObjectUrl } from '@/helpers/resolveMediaObjectUrl.js';
import { sanitizeDStorageUrl } from '@/helpers/sanitizeDStorageUrl.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import type { MediaObject } from '@/types/compose.js';

const getClass = (size: number) => {
    if (size === 1) {
        return {
            aspect: 'aspect-w-16 aspect-h-10',
            row: 'grid-cols-1 grid-rows-1',
        };
    } else if (size >= 5) {
        return {
            aspect: 'aspect-square',
            row: 'grid-cols-3',
        };
    } else if (size === 2) {
        return {
            aspect: 'aspect-w-16 aspect-h-12',
            row: 'grid-cols-2 grid-rows-1',
        };
    } else if (size > 2) {
        return {
            aspect: 'aspect-w-16 aspect-h-12',
            row: 'grid-cols-2 grid-rows-2',
        };
    }
    return {
        aspect: '',
        row: '',
    };
};

interface ComposeImagesProps extends HTMLProps<HTMLDivElement> {
    images: MediaObject[];
    readonly?: boolean;
}
export const ComposeImages = memo(function ComposeImages({ images, readonly = false, ...rest }: ComposeImagesProps) {
    const { removeImage } = useComposeStateStore();
    const size = images.length;
    const moreImageCount = size - 9;
    const showSize = Math.min(size, 9);

    if (size === 1) {
        return (
            <div {...rest} className={classNames('relative', rest.className)}>
                <ImageAsset
                    className={'w-full cursor-pointer rounded-lg object-cover'}
                    width={1000}
                    height={1000}
                    src={sanitizeDStorageUrl(resolveMediaObjectUrl(images[0]))}
                    alt={images[0].file.name}
                />
                {!readonly ? (
                    <RemoveButton className="absolute right-1 top-1 z-10" onClick={() => removeImage(images[0])} />
                ) : null}
            </div>
        );
    }

    return (
        <div {...rest} className={classNames('grid gap-2', getClass(showSize).row, rest.className)}>
            {images.map((image, index, list) => {
                const uri = sanitizeDStorageUrl(resolveMediaObjectUrl(image));
                const isLast = list.length === index;
                return (
                    <div
                        key={index}
                        className={classNames('relative flex items-center justify-center', getClass(showSize).aspect, {
                            'max-h-[288px]': size === 2 || showSize === 4,
                            'max-h-[284px]': size === 3 && index === 2,
                            'row-span-2': size === 3 && index === 2,
                            'max-h-[138px]': size === 3 && index !== 2,
                            relative: isLast && moreImageCount > 0,
                        })}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            className="h-full shrink-0 cursor-pointer rounded-lg object-cover"
                            loading="lazy"
                            src={formatImageUrl(uri, ATTACHMENT)}
                            alt={formatImageUrl(uri, ATTACHMENT)}
                        />
                        {isLast && moreImageCount > 0 ? (
                            <div className="absolute right-0 top-0 flex h-full w-full items-center justify-center rounded-lg bg-mainLight/50 text-white">
                                <div className={'text-2xl font-bold'}>+{moreImageCount + 1}</div>
                            </div>
                        ) : null}
                        {!readonly ? (
                            <RemoveButton className="absolute right-1 top-1 z-10" onClick={() => removeImage(image)} />
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
});
