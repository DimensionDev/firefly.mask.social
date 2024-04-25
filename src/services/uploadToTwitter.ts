export async function uploadToTwitter(files: File[]) {
    const medias = await Promise.all(
        files.map((x) => {
            const formData = new FormData();
            formData.append('file', x);
            return fetch('/api/twitter/uploadMedia', {
                method: 'POST',
                body: formData,
            });
        }),
    );
    console.log(medias, 'medias');
    return medias.map((x, i) => ({
        ...x,
        file: files[i],
    }));
}
