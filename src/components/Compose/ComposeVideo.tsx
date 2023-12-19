import { t } from '@lingui/macro';
import { useAsyncFn, useMount } from 'react-use';

import CloseIcon from '@/assets/close.svg';
import LoadingIcon from '@/assets/loading.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';
import { createImageUrl } from '@/helpers/createImageUrl.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { uploadFileToIPFS } from '@/services/uploadToIPFS.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

export default function ComposeVideo() {
    const { video, updateVideo } = useComposeStateStore();

    const enqueueSnackbar = useCustomSnackbar();

    const [{ loading, error }, handleVideoUpaload] = useAsyncFn(async () => {
        if (!video || video.ipfs) return;

        const ipfs = await uploadFileToIPFS(video.file);
        if (!ipfs) {
            enqueueSnackbar(t`Failed to upload video. Network error`, {
                variant: 'error',
            });
        } else {
            updateVideo({
                ...video,
                ipfs,
            });
        }
    }, [enqueueSnackbar, updateVideo, video]);

    useMount(() => {
        handleVideoUpaload();
    });

    if (!video) return null;

    return (
        <div className=" relative">
            <video controls src={createImageUrl(video.file)} />
            <div className=" absolute right-2 top-2 z-50 h-[18px] w-[18px]">
                <Tooltip content={t`Remove`} placement="top">
                    <CloseIcon className=" cursor-pointer" width={18} height={18} onClick={() => updateVideo(null)} />
                </Tooltip>
            </div>

            {!video.ipfs || loading || error ? (
                <div
                    className={classNames(
                        ' absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-main/25 bg-opacity-30',
                        !video.ipfs && !loading ? ' cursor-pointer' : ' ',
                    )}
                    onClick={() => !video.ipfs && !loading && handleVideoUpaload()}
                >
                    {loading ? (
                        <LoadingIcon className={loading ? 'animate-spin' : undefined} width={24} height={24} />
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
