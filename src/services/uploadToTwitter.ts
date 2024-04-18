import { TwitterApi } from "twitter-api-v2";

function fileToBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result as ArrayBuffer);
        };

        reader.onerror = error => {
            reject(error);
        };

        reader.readAsArrayBuffer(file);
    });
}

export async function uploadToTwitter(files: File[]) {
    const Twitter = new TwitterApi()

    const medias = await Promise.all(files.map(async (x) => {
        const buffer = await fileToBuffer(x)
        return await Twitter.v1.uploadMedia(Buffer.from(buffer), {type: x.type})
    }));
    return medias.map((x, i) => ({
        media_id: Number(x),
        media_id_string: x,
        file: files[i],
    }));
}
