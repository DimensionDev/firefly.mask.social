import { memo } from 'react';

import { Image } from '@/components/Image.js';
import { VideoAsset } from '@/components/Posts/VideoAsset.js';
import type { Source } from '@/constants/enum.js';
import type { Attachment } from '@/providers/types/SocialMedia.js';

interface PreviewContentProps {
    source: Source;
    asset: Attachment;
}

export const PreviewContent = memo<PreviewContentProps>(function PreviewContent({ source, asset }) {
    return asset.type === 'Image' ? (
        <Image
            key={asset.uri}
            src={asset.uri}
            alt={asset.title ?? asset.uri}
            width={1000}
            height={1000}
            className="max-h-[calc(100vh-110px)] w-full object-contain max-md:h-[calc(calc(100vh-env(safe-area-inset-bottom)-env(safe-are-inset-top)-90px))] max-md:max-w-[calc(100%-30px)]"
        />
    ) : asset.type === 'AnimatedGif' ? (
        <div className="w-4/5">
            <VideoAsset asset={asset} source={source} autoPlay />
        </div>
    ) : null;
});
