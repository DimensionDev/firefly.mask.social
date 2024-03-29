import { t } from '@lingui/macro';
import { useMemo } from 'react';

import CloseIcon from '@/assets/close.svg';
import { Tippy } from '@/esm/Tippy.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

export function ComposeVideo() {
    const {
        computed: { video },
        updateVideo,
    } = useComposeStateStore();
    const blobURL = useMemo(() => (video?.file ? URL.createObjectURL(video.file) : ''), [video?.file]);

    if (!video) return null;

    return (
        <div className=" relative mt-3 overflow-hidden rounded-2xl">
            <video controls src={blobURL} />
            <Tippy content={<span>{t`Remove`}</span>} placement="top">
                <div
                    className="radius-8 absolute right-1 top-1 z-50 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-500 hover:bg-opacity-70"
                    onClick={() => updateVideo(null)}
                    role="button"
                >
                    <CloseIcon width={18} height={18} color="#fff" />
                </div>
            </Tippy>
        </div>
    );
}
