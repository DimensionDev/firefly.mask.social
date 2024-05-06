import { fetchJSON } from '@/helpers/fetchJSON.js';

interface UploadMediaResponse {
    data: {
        media_id: number;
        media_id_string: string;
    };
}

export async function uploadToTwitter(files: File[]) {
    const medias = await Promise.all(
        files.map((x) => {
            const formData = new FormData();
            formData.append('file', x);

            return fetchJSON<UploadMediaResponse>(
                '/api/twitter/uploadMedia',
                {
                    method: 'POST',
                    body: formData,
                },
                {
                    noDefaultContentType: true,
                },
            );
        }),
    );
    return medias.map((x, i) => ({
        file: files[i],
        media_id: x.data.media_id,
        media_id_string: x.data.media_id_string,
    }));
}
