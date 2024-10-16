import { Trans } from '@lingui/macro';
import { PauseIcon, PlayIcon } from '@livepeer/react/assets';
import * as Player from '@livepeer/react/player';

import Play from '@/assets/play.svg';
import { Image } from '@/components/Image.js';
import { VideoPoster } from '@/components/Posts/VideoPoster.js';
import { Source } from '@/constants/enum.js';
import { dynamic } from '@/esm/dynamic.js';
import type { Attachment } from '@/providers/types/SocialMedia.js';

const Video = dynamic(() => import('@/components/Posts/Video.js').then((module) => module.Video), { ssr: false });

interface VideoAssetProps {
    asset: Attachment;
    source: Source;
    isQuote?: boolean;
    autoPlay?: boolean;
    videoClassName?: string;
    minimal?: boolean;
}

export function VideoAsset({ asset, isQuote, minimal, source, autoPlay, videoClassName }: VideoAssetProps) {
    const isGif = asset.type === 'AnimatedGif';

    return minimal ? (
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
            ) : source === Source.Farcaster ? (
                <VideoPoster src={asset.uri} />
            ) : null}
        </div>
    ) : (
        <Video
            className={videoClassName}
            loop={isGif}
            autoPlay={autoPlay || isGif}
            src={asset.uri}
            poster={asset.coverUri}
            forceNoToken={source === Source.Twitter}
        >
            {isGif ? (
                <span
                    className="absolute bottom-[5px] left-2.5 flex items-center"
                    onClick={(event) => event.stopPropagation()}
                >
                    <Player.PlayPauseTrigger className="h-[25px] w-[25px]">
                        <Player.PlayingIndicator asChild matcher={false}>
                            <PlayIcon />
                        </Player.PlayingIndicator>
                        <Player.PlayingIndicator asChild>
                            <PauseIcon />
                        </Player.PlayingIndicator>
                    </Player.PlayPauseTrigger>
                    <span className="font-bold text-white">
                        <Trans>GIF</Trans>
                    </span>
                </span>
            ) : null}
        </Video>
    );
}
