import { t } from '@lingui/macro';
import { memo, useMemo } from 'react';

import CloseIcon from '@/assets/close.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import type { MediaObject } from '@/types/index.js';

interface ComposeImageProps {
    index: number;
    size: number;
    image: MediaObject;
}
export const ComposeImage = memo(function ComposeImage({ index, size, image }: ComposeImageProps) {
    const { removeImage } = useComposeStateStore();
    const blobURL = useMemo(() => URL.createObjectURL(image.file), [image.file]);

    return (
        <div
            className={classNames(
                ' group overflow-hidden rounded-2xl',
                size <= 2 ? ' h-72' : size === 3 && index === 2 ? ' h-72' : ' h-[138px]',
                size === 1 ? ' col-span-2' : '',
                size === 3 && index === 1 ? ' col-start-1' : '',
                size === 3 && index === 2 ? ' absolute right-3 top-3 w-[251px]' : ' relative',
            )}
        >
            <Image src={blobURL} alt={image.file.name} fill className=" object-cover" />
            <Tooltip content={t`Remove`} placement="top">
                <div
                    className=" absolute right-1 top-1 z-50 hidden h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-gray-500 hover:bg-opacity-70 group-hover:inline-flex"
                    onClick={() => removeImage(image)}
                    role="button"
                >
                    <CloseIcon width={18} height={18} color="#fff" />
                </div>
            </Tooltip>
        </div>
    );
});
