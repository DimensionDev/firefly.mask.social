import { resolveMediaObjectUrl } from '@/helpers/resolveMediaObjectUrl.js';
import { type MediaObject, MediaSource } from '@/types/compose.js';

async function downloadUrl(url: string, name: string) {
    const blob = await fetch(url).then((res) => res.blob());
    return new File([blob], name, { type: blob.type });
}

export async function downloadMediaObjects(medias: MediaObject[]) {
    return await Promise.all(
        medias.map(async (media) => {
            const url = resolveMediaObjectUrl(media, [MediaSource.Giphy]);
            return {
                ...media,
                file: url ? await downloadUrl(url, media.file.name) : media.file,
            };
        }),
    );
}
