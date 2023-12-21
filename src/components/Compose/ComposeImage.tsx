import { t } from '@lingui/macro';
import { useMemo } from 'react';

import CloseIcon from '@/assets/close.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import type { MediaObject } from '@/types/index.js';

interface ComposeImageProps {
    index: number;
    image: MediaObject;
}
export default function ComposeImage({ index, image }: ComposeImageProps) {
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
            <div className=" absolute right-2 top-2 z-50 h-[18px] w-[18px]">
                <Tooltip content={t`Remove`} placement="top">
                    <CloseIcon className=" cursor-pointer" width={18} height={18} onClick={() => removeImage(image)} />
                </Tooltip>
            </div>
        </div>
    );
}
