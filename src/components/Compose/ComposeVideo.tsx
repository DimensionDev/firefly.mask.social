import { useMemo } from 'react';

import { RemoveButton } from '@/components/RemoveButton.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

export function ComposeVideo() {
    const { updateVideo } = useComposeStateStore();
    const { video } = useCompositePost();
    const blobURL = useMemo(() => (video?.file ? URL.createObjectURL(video.file) : ''), [video?.file]);

    if (!video) return null;

    return (
        <div className=" relative mt-3 overflow-hidden rounded-2xl">
            <video controls src={blobURL} />

            <RemoveButton className=" absolute right-1 top-1 z-10" size={18} onClick={() => updateVideo(null)} />
        </div>
    );
}
