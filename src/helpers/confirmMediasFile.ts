import { type MediaObject,MediaObjectSource } from "@/types/index.js";

async function convertUrlToFile(url: string, name: string) {
    const blob = await fetch(url).then((res) => res.blob());
    return new File([blob], name, { type: blob.type });
}

export async function confirmMediasFile(medias: MediaObject[]) {
    return await Promise.all(
        medias.map(async (media) => ({
            ...media,
            file: media.source !== MediaObjectSource.local ? await convertUrlToFile(media.url, media.file.name) : media.file,
        }))
    );
}
