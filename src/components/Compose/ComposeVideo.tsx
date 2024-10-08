import { useMemo } from 'react';

import { RemoveButton } from '@/components/RemoveButton.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import type { MediaObject } from '@/types/compose.js';

interface ComposeVideoProps {
    video: MediaObject;
}

export function ComposeVideo({ video }: ComposeVideoProps) {
    const { updateVideo } = useComposeStateStore();
    const blobURL = useMemo(() => (video?.file ? URL.createObjectURL(video.file) : ''), [video?.file]);

    return (
        <div className="relative mt-3 overflow-hidden rounded-2xl">
            <video className="w-full" controls src={blobURL} />

            <RemoveButton className="absolute right-1 top-1 z-10" size={18} onClick={() => updateVideo(null)} />
        </div>
    );
}
