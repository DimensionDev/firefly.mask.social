import { fetchJSON } from '@/helpers/fetchJSON.js';

function fileToBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result as ArrayBuffer);
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsArrayBuffer(file);
    });
}

export async function uploadToTwitter(files: File[]) {
    const medias = await Promise.all(
        files.map(async (x) => {
            const buffer = await fileToBuffer(x);
            return { buffer, type: x.type };
        }),
    );
    const results = await Promise.all(
        medias.map(async (x) => {
            return await fetchJSON<string>('/api/twitter/uploadMedia', { method: 'POST', body: JSON.stringify(x) });
        }),
    );
    return results.map((x, i) => ({ media_id: Number(x), media_id_string: x, file: files[i] }));
}
