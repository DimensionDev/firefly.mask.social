import { memoizePromise } from '@masknet/kit';
import { memoize } from 'lodash-es';

interface VideoMetadata {
    duration: number;
    width: number;
    height: number;
}

function resolver(file: File) {
    return new Promise<VideoMetadata>((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.autoplay = true;
        video.muted = true;

        video.onloadedmetadata = () => {
            resolve({
                duration: video.duration,
                width: video.videoWidth,
                height: video.videoHeight,
            });
        };
        video.onerror = reject;
        video.onabort = reject;

        video.src = URL.createObjectURL(file);
    });
}

export const getVideoMetadata = memoizePromise(memoize, resolver, (file) => file);
