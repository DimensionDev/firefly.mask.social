import { type MediaObject } from '@/types/compose.js';

export function mergeMediaObject(dest: MediaObject, source: MediaObject): MediaObject {
    if (dest.id !== source.id) throw new Error('Merge media objects with different ids.');
    return {
        ...dest,
        ...source,
        urls: {
            ...dest.urls,
            ...source.urls,
        },
    };
}

export function mergeMediaObjects(dest: MediaObject[], source: MediaObject[]): MediaObject[] {
    const results = [...dest, ...source.filter((x) => !dest.find((y) => x.id === y.id))];
    return results.map((destMedia) => {
        const sourceMedia = source.find((y) => destMedia.id === y.id);
        if (sourceMedia) return mergeMediaObject(destMedia, sourceMedia);
        return destMedia;
    });
}
