import { t } from '@lingui/macro';
import { useMemo } from 'react';

import CloseIcon from '@/assets/close.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

export default function ComposeVideo() {
    const { video, updateVideo } = useComposeStateStore();
    const blobURL = useMemo(() => (video?.file ? URL.createObjectURL(video.file) : ''), [video?.file]);

    if (!video) return null;

    return (
        <div className=" relative mt-3 overflow-hidden rounded-2xl">
            <video controls src={blobURL} />
            <div className=" absolute right-2 top-2 z-50 h-[18px] w-[18px]">
                <Tooltip content={t`Remove`} placement="top">
                    <CloseIcon className=" cursor-pointer" width={18} height={18} onClick={() => updateVideo(null)} />
                </Tooltip>
            </div>
        </div>
    );
}
