import { t } from '@lingui/macro';
import { memo, useMemo } from 'react';

import CloseIcon from '@/assets/close.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
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
            <ClickableButton
                className=" absolute right-1 top-1 z-10 hidden h-7 w-7 items-center justify-center text-main group-hover:inline-flex"
                onClick={() => removeImage(image)}
            >
                <Tooltip content={t`Remove`} placement="top">
                    <CloseIcon className=" cursor-pointer" width={18} height={18} />
                </Tooltip>
            </ClickableButton>
        </div>
    );
});
