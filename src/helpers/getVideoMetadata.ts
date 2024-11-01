import { memoizePromise } from '@/helpers/memoizePromise.js';

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

export const getVideoMetadata = memoizePromise(
    resolver,
    (file) => `${file.name}_${file.lastModified}_${file.webkitRelativePath}`,
);
