import { fetchJSON } from '@/helpers/fetchJSON.js';
import { TwitterBaseAPI } from '@masknet/web3-providers/types';

export async function uploadToTwitter(files: File[]) {
    const medias = await Promise.all(
        files.map((x) => {
            const formData = new FormData();
            formData.append('file', x);
            return fetchJSON<TwitterBaseAPI.MediaResponse>('/api/twitter/uploadMedia', {
                method: 'POST',
                body: formData,
            });
        }),
    );
    return medias.map((x, i) => ({
        ...x,
        file: files[i],
    }));
}
