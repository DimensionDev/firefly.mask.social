import { memo } from 'react';

import Play from '@/assets/play.svg';
import { dynamic } from '@/esm/dynamic.js';

const Video = dynamic(() => import('@/components/Posts/Video.js').then((module) => module.Video), { ssr: false });

interface VideoPosterProps {
    src: string;
}

export const VideoPoster = memo<VideoPosterProps>(function VideoPoster({ src }) {
    return (
        <div className="flex h-[120px] w-[120px] items-center rounded-xl">
            <Video className="w-full" src={src} objectFit="cover">
                <Play
                    className="absolute left-1/2 top-1/2 -translate-x-2 -translate-y-2 text-white"
                    width={16}
                    height={16}
                />
            </Video>
        </div>
    );
});
