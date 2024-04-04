/* eslint-disable react/no-danger */

import { classNames } from '@/helpers/classNames.js';

interface PlayerProps {
    html: string;
    isSpotify?: boolean;
}

export function Player({ html, isSpotify = false }: PlayerProps) {
    return (
        <div className="mt-4 w-full max-w-full text-sm">
            <div
                className={classNames('oembed-player', { 'spotify-player': isSpotify })}
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
    );
}
