'use client';

import { useRef, useState } from 'react';

import PlayIcon from '@/assets/play.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { NFTImage } from '@/components/NFTImage.js';
import type { SimpleHash } from '@/providers/simplehash/type.js';

export function NFTInfoPreview({
    name,
    imageURL,
    video,
}: {
    imageURL: string;
    video?: {
        properties: SimpleHash.VideoProperties;
        url: string;
    };
    name: string;
}) {
    const iconClassName = 'size-4 text-primaryBottom';
    const [isStarted, setIsStarted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const ref = useRef<HTMLVideoElement | null>(null);
    return (
        <div className="relative h-full w-full max-w-[230px] overflow-hidden rounded-[20px] object-cover shadow-lightS3">
            {!isStarted || !isPlaying ? (
                <ClickableButton
                    className="absolute left-1/2 top-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg bg-black/25"
                    onClick={() => {
                        ref.current?.play();
                        setIsStarted(true);
                    }}
                >
                    <PlayIcon className={iconClassName} />
                </ClickableButton>
            ) : null}
            {video ? (
                <video
                    ref={ref}
                    playsInline
                    src={video.url}
                    poster={imageURL}
                    autoPlay
                    loop
                    className="h-full w-full cursor-pointer"
                    onClick={() => {
                        if (ref.current?.paused) {
                            ref.current?.play();
                        } else {
                            ref.current?.pause();
                        }
                        setIsStarted(true);
                    }}
                    onPlay={() => {
                        setIsPlaying(true);
                    }}
                    onPause={() => {
                        setIsPlaying(false);
                    }}
                />
            ) : (
                <NFTImage width={230} height={230} src={imageURL} alt={name} className="h-full w-full object-cover" />
            )}
        </div>
    );
}
