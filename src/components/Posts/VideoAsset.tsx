import { Trans } from '@lingui/macro';
import { PlayButton } from '@livepeer/react';
import urlcat from 'urlcat';

import Play from '@/assets/play.svg';
import { Image } from '@/components/Image.js';
import { Source } from '@/constants/enum.js';
import { dynamic } from '@/esm/dynamic.js';
import type { Attachment } from '@/providers/types/SocialMedia.js';

const Video = dynamic(() => import('@/components/Posts/Video.js').then((module) => module.Video), { ssr: false });

const forwardTwitterVideo = (url: string) => {
    return urlcat(location.origin, '/api/twitter/videoForward', { url });
};

interface VideoAssetProps {
    asset: Attachment;
    source: Source;
    isQuote?: boolean;
    autoPlay?: boolean;
}

export function VideoAsset({ asset, isQuote, source, autoPlay }: VideoAssetProps) {
    const isGif = asset.type === 'AnimatedGif';

    return isQuote ? (
        <div className="relative h-full w-full">
            <div className="absolute inset-0 m-auto box-border flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-xl bg-white/80 text-[#181818]">
                <Play width={16} height={16} />
            </div>
            {asset.coverUri ? (
                <Image
                    width={120}
                    height={120}
                    className="h-full w-full rounded-xl object-cover"
                    src={asset.coverUri}
                    alt={asset.coverUri}
                />
            ) : null}
        </div>
    ) : (
        <Video
            loop={isGif}
            autoPlay={autoPlay || isGif}
            src={source === Source.Twitter ? forwardTwitterVideo(asset.uri) : asset.uri}
            poster={asset.coverUri}
        >
            {isGif ? (
                <span
                    className="absolute bottom-[5px] left-2.5 flex items-center"
                    onClick={(event) => event.stopPropagation()}
                >
                    <PlayButton />
                    <span className="font-bold text-white">
                        <Trans>GIF</Trans>
                    </span>
                </span>
            ) : null}
        </Video>
    );
}
