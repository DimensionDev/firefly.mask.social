export async function uploadToS3(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch('/api/s3', {
        method: 'PUT',
        body: formData,
    })
    const data = await response.json() as { link: string }
    return data.link
}
