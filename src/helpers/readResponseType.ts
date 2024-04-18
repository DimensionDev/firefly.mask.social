export async function readResponseType(response: Response) {
    const blob = await response.clone().blob();
    return blob.type;
}
