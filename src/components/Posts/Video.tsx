import {
    EnterFullscreenIcon,
    ExitFullscreenIcon,
    LoadingIcon,
    MuteIcon,
    PauseIcon,
    PlayIcon,
    UnmuteIcon,
} from '@livepeer/react/assets';
import { getSrc } from '@livepeer/react/external';
import * as Player from '@livepeer/react/player';
import { type HTMLProps, memo } from 'react';

import { ClickableArea } from '@/components/ClickableArea.js';

interface VideoProps extends HTMLProps<HTMLVideoElement> {
    forceNoToken?: boolean;
}

export const Video = memo<VideoProps>(function Video({
    className = '',
    poster,
    src,
    autoPlay = false,
    loop = false,
    forceNoToken,
    children,
}) {
    return (
        <ClickableArea className={className}>
            {/* Autoplay will not work in many modern browsers without setting mute to 0. */}
            <Player.Root src={getSrc(src)} volume={autoPlay ? 0 : 1} autoPlay={autoPlay} forceNoToken={forceNoToken}>
                <Player.Container className="bg-black text-white">
                    <Player.Video
                        loop={loop}
                        className="h-full w-full object-contain"
                        poster={poster}
                        muted={autoPlay}
                    />

                    <Player.LoadingIndicator asChild>
                        <div className="flex h-full w-full items-center justify-center">
                            <LoadingIcon className="h-6 w-6 animate-spin" />
                        </div>
                    </Player.LoadingIndicator>

                    <Player.ErrorIndicator matcher="all" asChild>
                        <div className="flex h-full w-full items-center justify-center">
                            <LoadingIcon className="h-6 w-6 animate-spin" />
                        </div>
                    </Player.ErrorIndicator>
                    {children ? (
                        children
                    ) : (
                        <>
                            <Player.Controls
                                className="flex flex-col-reverse gap-1 px-1 py-2"
                                style={{
                                    background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.6))',
                                }}
                            >
                                <div className="flex justify-between gap-5 px-3">
                                    <div className="flex flex-1 items-center gap-[10px]">
                                        <Player.PlayPauseTrigger className="h-[25px] w-[25px]">
                                            <Player.PlayingIndicator asChild matcher={false}>
                                                <PlayIcon />
                                            </Player.PlayingIndicator>
                                            <Player.PlayingIndicator asChild>
                                                <PauseIcon />
                                            </Player.PlayingIndicator>
                                        </Player.PlayPauseTrigger>
                                        <Player.MuteTrigger className="h-[25px] w-[25px]">
                                            <Player.VolumeIndicator asChild matcher={false}>
                                                <MuteIcon />
                                            </Player.VolumeIndicator>
                                            <Player.VolumeIndicator asChild matcher>
                                                <UnmuteIcon />
                                            </Player.VolumeIndicator>
                                        </Player.MuteTrigger>

                                        <Player.Volume
                                            style={{
                                                position: 'relative',
                                                display: 'flex',
                                                flexGrow: 1,
                                                height: 25,
                                                alignItems: 'center',
                                                maxWidth: 120,
                                                touchAction: 'none',
                                                userSelect: 'none',
                                            }}
                                        >
                                            <Player.Track
                                                style={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                                    position: 'relative',
                                                    flexGrow: 1,
                                                    borderRadius: 9999,
                                                    height: '2px',
                                                }}
                                            >
                                                <Player.Range
                                                    style={{
                                                        position: 'absolute',
                                                        backgroundColor: 'white',
                                                        borderRadius: 9999,
                                                        height: '100%',
                                                    }}
                                                />
                                            </Player.Track>
                                            <Player.Thumb
                                                style={{
                                                    display: 'block',
                                                    width: 12,
                                                    height: 12,
                                                    backgroundColor: 'white',
                                                    borderRadius: 9999,
                                                }}
                                            />
                                        </Player.Volume>

                                        <Player.Time />
                                    </div>
                                    <Player.FullscreenTrigger className="h-[25px] w-[25px]">
                                        <Player.FullscreenIndicator asChild matcher={false}>
                                            <EnterFullscreenIcon />
                                        </Player.FullscreenIndicator>
                                        <Player.FullscreenIndicator asChild>
                                            <ExitFullscreenIcon />
                                        </Player.FullscreenIndicator>
                                    </Player.FullscreenTrigger>
                                </div>
                                <Player.Seek className="relative flex h-5 touch-none select-none items-center">
                                    <Player.Track className="relative h-[2px] flex-grow rounded-full bg-white bg-opacity-70">
                                        <Player.SeekBuffer className="absolute h-full rounded-full bg-white bg-opacity-50" />
                                        <Player.Range className="absolute h-full rounded-full bg-white" />
                                    </Player.Track>
                                    <Player.Thumb className="block h-3 w-3 rounded-full bg-white" />
                                </Player.Seek>
                            </Player.Controls>
                        </>
                    )}
                </Player.Container>
            </Player.Root>
        </ClickableArea>
    );
});
