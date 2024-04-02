import { Twitter } from '@masknet/web3-providers';

export async function uploadToTwitter(files: File[]) {
    const medias = await Promise.all(files.map((x) => Twitter.uploadMedia(x)));
    return medias;
}
