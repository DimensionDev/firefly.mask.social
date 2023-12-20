import { t } from '@lingui/macro';

import CloseIcon from '@/assets/close.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { createImageUrl } from '@/helpers/createImageUrl.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

export default function ComposeVideo() {
    const { video, updateVideo } = useComposeStateStore();

    if (!video) return null;

    return (
        <div className=" relative">
            <video controls src={createImageUrl(video.file)} />
            <div className=" absolute right-2 top-2 z-50 h-[18px] w-[18px]">
                <Tooltip content={t`Remove`} placement="top">
                    <CloseIcon className=" cursor-pointer" width={18} height={18} onClick={() => updateVideo(null)} />
                </Tooltip>
            </div>
        </div>
    );
}
