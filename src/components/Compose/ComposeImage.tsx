import { t } from '@lingui/macro';
import { useCallback, useMemo, useState } from 'react';

import CloseIcon from '@/assets/close.svg';
import LoadingIcon from '@/assets/loading.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { createImageUrl } from '@/helpers/createImageUrl.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { uploadFilesToIPFS } from '@/services/uploadToIPFS.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

interface ComposeImageProps {
    index: number;
}
export default function ComposeImage({ index }: ComposeImageProps) {
    const [loading, setLoading] = useState(false);

    const { images, updateImages, removeImageByIndex } = useComposeStateStore();

    const image = useMemo(() => images[index], [images, index]);

    const len = useMemo(() => images.length, [images]);

    const enqueueSnackbar = useCustomSnackbar();

    const handleImageLoad = useCallback(async () => {
        setLoading(true);
        const response = await uploadFilesToIPFS([image.file]);
        if (response.length === 0) {
            enqueueSnackbar(t`Failed to upload. Network error`, {
                variant: 'error',
            });
        } else {
            const newImages = [...images];
            newImages[index].ipfs = response[0];
            updateImages([...newImages]);
        }
        setLoading(false);
    }, [enqueueSnackbar, image.file, images, index, updateImages]);

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
            <Image src={createImageUrl(image.file)} alt={image.file.name} fill className=" object-cover" />
            <div className=" absolute right-2 top-2 z-50 h-[18px] w-[18px]">
                <Tooltip content={t`Remove`} placement="top">
                    <CloseIcon
                        className=" cursor-pointer"
                        width={18}
                        height={18}
                        onClick={() => removeImageByIndex(index)}
                    />
                </Tooltip>
            </div>

            {!image.ipfs || loading ? (
                <div
                    className={classNames(
                        ' absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-main/25 bg-opacity-30',
                        !image.ipfs && !loading ? ' cursor-pointer' : ' ',
                    )}
                    onClick={() => !image.ipfs && !loading && handleImageLoad()}
                >
                    <LoadingIcon className={loading ? 'animate-spin' : undefined} width={24} height={24} />
                </div>
            ) : null}
        </div>
    );
}
