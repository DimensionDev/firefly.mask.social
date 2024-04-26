export async function uploadToTwitter(files: File[]) {
    const medias = await Promise.all(
        files.map((x) => {
            const formData = new FormData();
            formData.append('file', x);
            return fetch('/api/twitter/uploadMedia', {
                method: 'POST',
                body: formData,
            }).then((x) => x.json());
        }),
    );
    return medias.map((x, i) => ({
        media_id: x.data.media_id,
        media_id_string: x.data.media_id_string,
        file: files[i],
    }));
}
