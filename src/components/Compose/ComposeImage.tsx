import { t } from '@lingui/macro';
import { memo, useMemo } from 'react';

import CloseIcon from '@/assets/close.svg';
import { Image } from '@/esm/Image.js';
import { Tippy } from '@/esm/Tippy.js';
import { classNames } from '@/helpers/classNames.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import type { MediaObject } from '@/types/index.js';

interface ComposeImageProps {
    index: number;
    image: MediaObject;
}
export const ComposeImage = memo(function ComposeImage({ index, image }: ComposeImageProps) {
    const { images, removeImage } = useComposeStateStore();
    const blobURL = useMemo(() => URL.createObjectURL(image.file), [image.file]);

    const len = images.length;

    return (
        <div
            className={classNames(
                ' overflow-hidden rounded-2xl',
                len <= 2 ? ' h-72' : len === 3 && index === 2 ? ' h-72' : ' h-[138px]',
                len === 1 ? ' col-span-2' : '',
                len === 3 && index === 1 ? ' col-start-1' : '',
                len === 3 && index === 2 ? ' absolute right-3 top-3 w-[251px]' : ' relative',
            )}
        >
            <Image src={blobURL} alt={image.file.name} fill className=" object-cover" />
            <Tippy content={<span>{t`Remove`}</span>} placement="top">
                <div
                    className="radius-8 absolute right-1 top-1 z-50 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-500 hover:bg-opacity-70"
                    onClick={() => removeImage(image)}
                    role="button"
                >
                    <CloseIcon width={18} height={18} color="#fff" />
                </div>
            </Tippy>
        </div>
    );
});
