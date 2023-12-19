import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import CloseIcon from '@/assets/close.svg';
import LoadingIcon from '@/assets/loading.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { createImageUrl } from '@/helpers/createImageUrl.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { uploadFileToIPFS } from '@/services/uploadToIPFS.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import type { MediaObject } from '@/types/index.js';

interface ComposeImageProps {
    index: number;
    image: MediaObject;
}
export default function ComposeImage({ index, image }: ComposeImageProps) {
    const enqueueSnackbar = useCustomSnackbar();

    const { images, updateImages, removeImageByIndex } = useComposeStateStore();

    const [{ loading, error }, handleImageUpload] = useAsyncFn(async () => {
        if (image.ipfs) return;

        const ipfs = await uploadFileToIPFS(image.file);
        if (!ipfs) {
            enqueueSnackbar(t`Failed to upload image. Network error`, {
                variant: 'error',
            });
        } else {
            updateImages(
                images.map((image, i) => {
                    return i === index
                        ? {
                              ...image,
                              ipfs,
                          }
                        : image;
                }),
            );
        }
    }, [enqueueSnackbar, image.file, images, index, updateImages]);

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

            {loading || error ? (
                <div
                    className={classNames(
                        ' absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-main/25 bg-opacity-30',
                        !image.ipfs && !loading ? ' cursor-pointer' : ' ',
                    )}
                    onClick={() => !image.ipfs && !loading && handleImageUpload()}
                >
                    {loading ? (
                        <LoadingIcon className={loading ? 'animate-spin' : undefined} width={24} height={24} />
                    ) : error ? (
                        <ArrowPathIcon fontSize={24} />
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
