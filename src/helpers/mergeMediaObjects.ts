import { safeUnreachable } from '@masknet/kit';

import { type SocialSource, Source } from '@/constants/enum.js';
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

function composeMediaObjects(dest: MediaObject[], source: MediaObject[], socialSource: SocialSource): MediaObject[] {
    switch (socialSource) {
        case Source.Lens:
        case Source.Farcaster:
            return [...dest, ...source.filter((x) => !dest.find((y) => x.id === y.id))];
        case Source.Twitter:
            // twitter media id will changed after upload, so we update dest before merge
            const updatedDest = dest.map((media, index) => ({ ...media, id: source[index]?.id ?? media.id }));
            return [...updatedDest, ...source.filter((x) => !updatedDest.find((y) => x.id === y.id))];
        default:
            safeUnreachable(socialSource);
            return [];
    }
}

export function mergeMediaObjects(
    dest: MediaObject[],
    source: MediaObject[],
    socialSource: SocialSource,
): MediaObject[] {
    const results = composeMediaObjects(dest, source, socialSource);
    return results.map((destMedia) => {
        const sourceMedia = source.find((y) => destMedia.id === y.id);
        if (sourceMedia) return mergeMediaObject(destMedia, sourceMedia);
        return destMedia;
    });
}
