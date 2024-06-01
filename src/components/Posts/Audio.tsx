import 'plyr-react/plyr.css';

import { Trans } from '@lingui/macro';
import { memo } from 'react';

import Music from '@/assets/music.svg';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Image } from '@/components/Image.js';
import { Plyr } from '@/esm/Plyr.js';
import { classNames } from '@/helpers/classNames.js';

interface AudioProps {
    src: string;
    poster?: string;
    title?: string;
    artist?: string;
    className?: string;
}

export const Audio = memo<AudioProps>(function Audio({ poster, src, title, artist, className }) {
    return (
        <ClickableArea className={classNames('overflow-hidden rounded-2xl bg-thirdMain p-3', className ?? '')}>
            <div className="flex space-x-2">
                {poster ? (
                    <Image width={80} height={80} src={poster} className="h-20 w-20 rounded-xl" alt="title" />
                ) : (
                    <div className="box-content flex w-20 flex-col items-center justify-center space-y-2 rounded-xl bg-secondaryMain px-[7.5px] py-4">
                        <span className="text-primaryBottom opacity-50">
                            <Music width={24} height={24} />
                        </span>
                        <span className="break-keep text-[11px] font-medium leading-[16px] text-secondary">
                            <Trans>Audio Cover</Trans>
                        </span>
                    </div>
                )}
                <div className="flex w-full flex-col space-y-1 truncate">
                    <h5 className="truncate font-semibold text-main">{title}</h5>
                    <h6 className="truncate font-semibold text-main">{artist}</h6>
                </div>
            </div>
            <div className="mt-2">
                <Plyr
                    source={{ type: 'audio', sources: [{ src }] }}
                    options={{ controls: ['current-time', 'progress', 'duration', 'play'] }}
                />
            </div>
        </ClickableArea>
    );
});
